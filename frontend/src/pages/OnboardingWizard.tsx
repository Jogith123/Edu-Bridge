import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Save, User, Award, BookOpen, Briefcase } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const OnboardingWizard: React.FC = () => {
  const { updateProfileCompletion } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    dob: '',
    gender: 'male',
    state: 'Madhya Pradesh',
    district: '',
    pincode: '',
    category: 'general',
    religion: 'Hinduism',
    family_income: 150000,
    bpl_card: false,
    disability: false,
    disability_type: '',
    parent_occupation: '',
    current_class: '12th',
    stream: 'Science',
    percentage_10th: 75.0,
    percentage_12th: 72.0,
    percentage_graduation: 0.0,
    institution_name: '',
    board: 'CBSE',
    career_interests: [] as string[],
    languages: ['Hindi', 'English'] as string[],
  });

  const [interestInput, setInterestInput] = useState('');

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };


  const handleNext = () => {
    if (step === 1 && (!formData.district || !formData.pincode)) {
      toast.error('Please enter district and pincode');
      return;
    }
    if (step === 3 && (!formData.percentage_10th || !formData.percentage_12th || !formData.institution_name)) {
      toast.error('Please enter percentage details and institution name');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const addInterest = () => {
    if (interestInput.trim() && !formData.career_interests.includes(interestInput.trim())) {
      updateField('career_interests', [...formData.career_interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (item: string) => {
    updateField('career_interests', formData.career_interests.filter((i) => i !== item));
  };

  const handleSave = async () => {
    if (formData.career_interests.length === 0) {
      toast.error('Please add at least one career interest');
      return;
    }

    try {
      const response = await api.post('/student/profile', formData);
      if (response.status === 200) {
        updateProfileCompletion(true);
        // Force trigger eligibility engine run asynchronously
        api.post('/ai/eligibility', { force_refresh: true }).catch(err => console.log('Pre-run error', err));
        toast.success('Profile created successfully! Discovering matching opportunities...');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Could not save profile.');
    }
  };

  const stepsList = [
    { num: 1, title: t('onboarding.step1_title'), icon: <User className="h-5 w-5" /> },
    { num: 2, title: t('onboarding.step2_title'), icon: <Award className="h-5 w-5" /> },
    { num: 3, title: t('onboarding.step3_title'), icon: <BookOpen className="h-5 w-5" /> },
    { num: 4, title: t('onboarding.step4_title'), icon: <Briefcase className="h-5 w-5" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extrabold mb-2 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {t('onboarding.title')}
      </h1>
      <p className="text-text-secondary text-center mb-8 text-sm">
        {t('onboarding.subtitle')}
      </p>

      {/* Step Indicators */}
      <div className="flex justify-between items-center mb-10 bg-white/5 border border-white/10 p-4 rounded-2xl">
        {stepsList.map((s, idx) => (
          <div key={s.num} className="flex items-center gap-3 flex-1 justify-center">
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step >= s.num
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white/5 text-text-secondary border border-white/10'
              }`}
            >
              {s.icon}
            </div>
            <span
              className={`hidden md:inline text-xs font-semibold uppercase tracking-wider ${
                step >= s.num ? 'text-text-primary font-bold' : 'text-text-muted'
              }`}
            >
              {s.title}
            </span>
            {idx < stepsList.length - 1 && (
              <div className="hidden md:block h-[1px] bg-white/10 flex-1 mx-2"></div>
            )}
          </div>
        ))}
      </div>

      {/* Form Content Panel */}
      <div className="glass-panel p-8 relative min-h-[380px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold border-b border-white/5 pb-2 text-secondary">
                {t('onboarding.step1_title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary">{t('onboarding.dob')}</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => updateField('dob', e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary">{t('onboarding.gender')}</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                    className="glass-input"
                  >
                    <option value="male">{t('common.male', 'Male')}</option>
                    <option value="female">{t('common.female', 'Female')}</option>
                    <option value="other">{t('common.other', 'Other')}</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary">{t('onboarding.state')}</label>
                  <select
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    className="glass-input"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary">{t('onboarding.district')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Bhopal"
                    value={formData.district}
                    onChange={(e) => updateField('district', e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm text-text-secondary">{t('onboarding.pincode')}</label>
                  <input
                    type="text"
                    placeholder="462001"
                    value={formData.pincode}
                    onChange={(e) => updateField('pincode', e.target.value)}
                    className="glass-input"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold border-b border-white/5 pb-2 text-secondary">
                {t('onboarding.step2_title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary">{t('onboarding.category')}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="glass-input"
                  >
                    <option value="general">General</option>
                    <option value="obc">OBC (Other Backward Classes)</option>
                    <option value="sc">SC (Scheduled Caste)</option>
                    <option value="st">ST (Scheduled Tribe)</option>
                    <option value="ews">EWS (Economically Weaker Section)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary">{t('onboarding.family_income')}</label>
                  <input
                    type="number"
                    value={formData.family_income}
                    onChange={(e) => updateField('family_income', parseFloat(e.target.value))}
                    className="glass-input"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary">{t('onboarding.parent_occupation')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Farming / Shopkeeper"
                    value={formData.parent_occupation}
                    onChange={(e) => updateField('parent_occupation', e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary">{t('onboarding.religion')}</label>
                  <input
                    type="text"
                    value={formData.religion}
                    onChange={(e) => updateField('religion', e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="bpl"
                    checked={formData.bpl_card}
                    onChange={(e) => updateField('bpl_card', e.target.checked)}
                    className="h-5 w-5 accent-primary"
                  />
                  <label htmlFor="bpl" className="text-sm text-text-secondary cursor-pointer">
                    {t('onboarding.bpl_card')}
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="disability"
                    checked={formData.disability}
                    onChange={(e) => updateField('disability', e.target.checked)}
                    className="h-5 w-5 accent-primary"
                  />
                  <label htmlFor="disability" className="text-sm text-text-secondary cursor-pointer">
                    {t('onboarding.disability')}
                  </label>
                </div>

                {formData.disability && (
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm text-text-secondary">{t('onboarding.disability')}</label>
                    <input
                      type="text"
                      placeholder="e.g. Visual Impairment - 40%"
                      value={formData.disability_type}
                      onChange={(e) => updateField('disability_type', e.target.value)}
                      className="glass-input"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold border-b border-white/5 pb-2 text-secondary">
                {t('onboarding.step3_title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary">{t('onboarding.current_class')}</label>
                  <select
                    value={formData.current_class}
                    onChange={(e) => updateField('current_class', e.target.value)}
                    className="glass-input"
                  >
                    <option value="10th">10th Standard</option>
                    <option value="12th">12th Standard</option>
                    <option value="graduation">Undergraduate Graduation</option>
                    <option value="diploma">Technical Diploma</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary">{t('onboarding.stream')}</label>
                  <select
                    value={formData.stream}
                    onChange={(e) => updateField('stream', e.target.value)}
                    className="glass-input"
                  >
                    <option value="Science">Science (PCM/PCB)</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts / Humanities</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary">{t('onboarding.percentage_10th')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.percentage_10th}
                    onChange={(e) => updateField('percentage_10th', parseFloat(e.target.value))}
                    className="glass-input"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary">{t('onboarding.percentage_12th')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.percentage_12th}
                    onChange={(e) => updateField('percentage_12th', parseFloat(e.target.value))}
                    className="glass-input"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary">{t('onboarding.institution_name')}</label>
                  <input
                    type="text"
                    placeholder="Govt Higher Secondary School"
                    value={formData.institution_name}
                    onChange={(e) => updateField('institution_name', e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary">{t('onboarding.board')}</label>
                  <select
                    value={formData.board}
                    onChange={(e) => updateField('board', e.target.value)}
                    className="glass-input"
                  >
                    <option value="CBSE">CBSE (Central Board)</option>
                    <option value="State Board">State Board</option>
                    <option value="ICSE">ICSE</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold border-b border-white/5 pb-2 text-secondary">
                {t('onboarding.step4_title')}
              </h2>
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary">{t('onboarding.career_interests')}</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="e.g. computer-science, medical, civil-services, accounting"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                      className="glass-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={addInterest}
                      className="bg-primary hover:bg-primary-hover px-5 rounded-xl text-white font-bold cursor-pointer"
                    >
                      {t('onboarding.add_interest')}
                    </button>
                  </div>
                  <p className="text-xs text-text-muted">Type and click Add or press Enter</p>
                </div>

                {/* Display tags */}
                <div className="flex flex-wrap gap-2">
                  {formData.career_interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-semibold"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="text-red-400 hover:text-red-500 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {formData.career_interests.length === 0 && (
                    <span className="text-text-muted text-sm italic">No career interests added yet.</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Controls */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/5">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('onboarding.back')}
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer shadow-lg shadow-primary/20"
            >
              {t('onboarding.next')}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-success hover:bg-success-hover px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer shadow-lg shadow-success/20"
            >
              <Save className="h-4 w-4" />
              {t('onboarding.discover')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
