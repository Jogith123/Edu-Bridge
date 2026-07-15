"""
EduBridge AI — Personalized Scholarship RAG Engine
===================================================
Retrieval-Augmented Generation pipeline:
  1. Eligibility-aware retrieval  — filters DB by student profile (income, category, state, class)
  2. BM25 keyword ranking         — ranks survivors by relevance to the question
  3. Gemini-powered generation    — produces a grounded, citation-backed answer in any language

No external vector stores needed — your SQLite DB is the knowledge base.
"""
import re
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.scholarship import Scholarship
from app.models.government_scheme import GovernmentScheme
from app.models.student_profile import StudentProfile
from app.core.config import settings

LANGUAGE_NAMES: Dict[str, str] = {
    'en': 'English', 'hi': 'Hindi', 'te': 'Telugu', 'ta': 'Tamil',
    'bn': 'Bengali', 'mr': 'Marathi', 'kn': 'Kannada', 'pa': 'Punjabi',
}


# ── Text utilities ────────────────────────────────────────────────────────────

def _tokenize(text: str) -> List[str]:
    return re.findall(r'\b\w+\b', (text or '').lower())


def _bm25_score(
    query_tokens: List[str],
    doc_tokens: List[str],
    avg_doc_len: float,
    k1: float = 1.5,
    b: float = 0.75,
) -> float:
    if not doc_tokens or not query_tokens:
        return 0.0
    freq: Dict[str, int] = {}
    for t in doc_tokens:
        freq[t] = freq.get(t, 0) + 1
    score = 0.0
    for qt in set(query_tokens):
        if qt not in freq:
            continue
        tf = freq[qt]
        denom = tf + k1 * (1 - b + b * len(doc_tokens) / max(avg_doc_len, 1))
        score += tf * (k1 + 1) / denom
    return score


def _doc_to_text(doc: Dict[str, Any]) -> str:
    return ' '.join(filter(None, [
        doc.get('name', ''),
        doc.get('description', ''),
        doc.get('benefits', ''),
        doc.get('type', ''),
        ' '.join(doc.get('tags', []) or []),
        ' '.join(doc.get('eligible_categories', []) or []),
    ]))


# ── Eligibility filter ────────────────────────────────────────────────────────

def _is_eligible(doc: Dict[str, Any], profile: StudentProfile) -> bool:
    if doc.get('max_income') and profile.family_income:
        if profile.family_income > doc['max_income']:
            return False
    cats = doc.get('eligible_categories') or []
    if cats and 'all' not in [c.lower() for c in cats] and profile.category:
        if profile.category not in cats:
            return False
    states = doc.get('eligible_states') or []
    if states and profile.state:
        if profile.state not in states:
            return False
    classes = doc.get('eligible_classes') or []
    if classes and profile.current_class:
        if profile.current_class not in classes:
            return False
    if doc.get('gender_specific') and profile.gender:
        if doc['gender_specific'] != profile.gender:
            return False
    student_pct = profile.percentage_12th or profile.percentage_10th or 0.0
    if doc.get('min_percentage') and student_pct < doc['min_percentage']:
        return False
    return True


# ── DB model → doc dict ───────────────────────────────────────────────────────

def _scholarship_to_doc(s: Scholarship) -> Dict[str, Any]:
    return {
        'type': 'scholarship',
        'name': s.name,
        'provider': s.provider,
        'amount': s.amount or 'Check portal',
        'description': s.description or '',
        'benefits': s.benefits or '',
        'deadline': s.deadline or 'Check official portal',
        'apply_url': s.apply_url or 'https://scholarships.gov.in',
        'eligible_categories': s.eligible_categories or [],
        'eligible_states': s.eligible_states or [],
        'eligible_classes': s.eligible_classes or [],
        'max_income': s.max_income,
        'min_percentage': s.min_percentage,
        'tags': s.tags or [],
        'gender_specific': s.gender_specific,
        'documents_required': s.documents_required or [],
    }


def _scheme_to_doc(s: GovernmentScheme) -> Dict[str, Any]:
    return {
        'type': 'government_scheme',
        'name': s.name,
        'provider': s.ministry,
        'amount': s.benefit_amount or 'Check portal',
        'description': s.description or '',
        'benefits': s.benefits or '',
        'deadline': s.deadline or 'Check official portal',
        'apply_url': s.apply_url or 'https://myscheme.gov.in',
        'eligible_categories': s.eligible_categories or [],
        'eligible_states': s.eligible_states or [],
        'eligible_classes': [],
        'max_income': s.max_income,
        'min_percentage': s.min_percentage,
        'tags': s.tags or [],
        'gender_specific': s.gender_specific,
        'documents_required': s.documents_required or [],
    }


# ── Main pipeline ─────────────────────────────────────────────────────────────

async def retrieve_and_generate(
    question: str,
    profile: StudentProfile,
    language: str,
    db: AsyncSession,
    top_k: int = 5,
) -> Dict[str, Any]:
    """
    Full RAG pipeline:
    1. Load scholarships + schemes from DB
    2. Filter by student eligibility
    3. BM25-rank by question relevance
    4. Generate grounded answer with Gemini
    """
    # 1. Load knowledge base
    s_res = await db.execute(select(Scholarship).where(Scholarship.is_active == True))
    g_res = await db.execute(select(GovernmentScheme).where(GovernmentScheme.is_active == True))
    docs: List[Dict[str, Any]] = (
        [_scholarship_to_doc(s) for s in s_res.scalars().all()] +
        [_scheme_to_doc(s) for s in g_res.scalars().all()]
    )

    # 2. Eligibility filter
    eligible = [d for d in docs if _is_eligible(d, profile)]
    pool = eligible if eligible else docs

    # 3. BM25 ranking
    query_tokens = _tokenize(question)
    token_lists = [_tokenize(_doc_to_text(d)) for d in pool]
    avg_len = sum(len(t) for t in token_lists) / max(len(token_lists), 1)
    scored = sorted(
        zip(token_lists, pool),
        key=lambda pair: _bm25_score(query_tokens, pair[0], avg_len),
        reverse=True,
    )
    top_docs = [doc for _, doc in scored[:top_k]]

    # 4. Generate answer
    lang_name = LANGUAGE_NAMES.get(language, 'English')
    answer = await _generate_answer(question, profile, top_docs, lang_name)

    sources = [
        {
            'name': d['name'],
            'type': d['type'],
            'amount': d.get('amount'),
            'deadline': d.get('deadline'),
            'apply_url': d.get('apply_url'),
            'provider': d.get('provider'),
        }
        for d in top_docs
    ]
    return {'answer': answer, 'sources': sources, 'total_eligible': len(eligible)}


# ── Gemini generation ─────────────────────────────────────────────────────────

async def _generate_answer(
    question: str,
    profile: StudentProfile,
    docs: List[Dict[str, Any]],
    lang_name: str,
) -> str:
    if not docs:
        return _fallback_no_results(lang_name)
    if not settings.GEMINI_API_KEY:
        return _fallback_answer(docs, lang_name)

    income_str = f"Rs.{profile.family_income:,.0f}/year" if profile.family_income else "Not provided"

    context_blocks = []
    for i, d in enumerate(docs, 1):
        max_inc = f"Rs.{d['max_income']:,.0f}" if d.get('max_income') else "No limit"
        context_blocks.append(
            f"[Source {i}] {d['type'].replace('_', ' ').title()}: {d['name']}\n"
            f"  Provider      : {d.get('provider', 'Government of India')}\n"
            f"  Amount/Benefit: {d.get('amount', 'Check portal')}\n"
            f"  Deadline      : {d.get('deadline', 'Check portal')}\n"
            f"  Max Income    : {max_inc}\n"
            f"  Categories    : {', '.join(d.get('eligible_categories', [])) or 'All'}\n"
            f"  Description   : {d.get('description', '')[:300]}\n"
            f"  Benefits      : {d.get('benefits', '')[:200]}\n"
            f"  Documents     : {', '.join(d.get('documents_required', [])) or 'Standard documents'}\n"
            f"  Apply URL     : {d.get('apply_url', 'scholarships.gov.in')}"
        )

    prompt = f"""You are EduBridge AI, an expert educational counsellor for rural Indian students.

STUDENT PROFILE:
  State: {profile.state} | Category: {profile.category} | Gender: {profile.gender or 'Not specified'}
  Class: {profile.current_class} | Stream: {profile.stream}
  Family Income: {income_str}
  10th Score: {profile.percentage_10th or 'N/A'}% | 12th Score: {profile.percentage_12th or 'N/A'}%
  Career Goals: {', '.join(profile.career_interests or ['Not specified'])}

RETRIEVED KNOWLEDGE BASE (answer ONLY from these — never invent schemes):
{chr(10).join(context_blocks)}

STUDENT QUESTION: {question}

RULES:
1. Reply entirely in {lang_name}.
2. Open with eligibility verdict: ✅ Eligible / ❌ Not Eligible / ⚠️ Partially Eligible.
3. Cite [Source N] for each claim.
4. Mention exact amounts, deadlines, income limits from the sources.
5. Give 3-4 simple application steps (basic digital literacy assumed).
6. End with the apply URL.
7. Do NOT add any information not present in the retrieved sources."""

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash')
        resp = model.generate_content(prompt)
        return resp.text
    except Exception as exc:
        print(f"[RAG] Gemini error: {exc}")
        return _fallback_answer(docs, lang_name)


# ── Fallbacks ─────────────────────────────────────────────────────────────────

def _fallback_no_results(lang_name: str) -> str:
    m = {
        'Hindi': "आपकी प्रोफ़ाइल से मेल खाने वाली कोई योजना नहीं मिली। अपनी प्रोफ़ाइल पूरी करें।",
        'Telugu': "మీ ప్రొఫైల్‌కు సరిపోయే పథకాలు కనుగొనబడలేదు. దయచేసి మీ ప్రొఫైల్‌ను పూర్తి చేయండి.",
    }
    return m.get(lang_name, "No matching opportunities found. Please complete your profile for better results.")


def _fallback_answer(docs: List[Dict], lang_name: str) -> str:
    listing = '\n'.join(f"* {d['name']} — {d.get('amount', '')}" for d in docs[:3])
    m = {
        'Hindi': f"आपकी प्रोफ़ाइल के आधार पर ये अवसर:\n{listing}\n\nआवेदन: scholarships.gov.in",
        'Telugu': f"మీ ప్రొఫైల్ ఆధారంగా:\n{listing}\n\nదరఖాస్తు: scholarships.gov.in",
    }
    return m.get(lang_name, f"Based on your profile:\n{listing}\n\nApply at: scholarships.gov.in")
