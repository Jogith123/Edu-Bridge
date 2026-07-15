import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Upload, Scan, CheckCircle, AlertTriangle, Zap, RefreshCw } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface ExtractedFields {
  name?: string | null;
  dob?: string | null;
  gender?: string | null;
  state?: string | null;
  district?: string | null;
  pincode?: string | null;
  category?: string | null;
  family_income?: number | null;
  current_class?: string | null;
  percentage_10th?: number | null;
  percentage_12th?: number | null;
  institution_name?: string | null;
  board?: string | null;
}

interface ScanResult {
  document_type?: string;
  confidence?: 'high' | 'medium' | 'low';
  fields?: ExtractedFields;
  summary?: string;
  error?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (fields: ExtractedFields) => void;
}

type ScanState = 'idle' | 'uploading' | 'scanning' | 'done' | 'error';

const FIELD_LABELS: Record<string, string> = {
  name: 'Name', dob: 'Date of Birth', gender: 'Gender', state: 'State',
  district: 'District', pincode: 'Pincode', category: 'Category',
  family_income: 'Annual Income', current_class: 'Class', percentage_10th: '10th %',
  percentage_12th: '12th %', institution_name: 'Institution', board: 'Board'
};

export const DocumentScanModal: React.FC<Props> = ({ isOpen, onClose, onApply }) => {
  const { t } = useTranslation();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const reset = () => {
    setScanState('idle');
    setResult(null);
    setPreview(null);
  };

  const processFile = async (file: File) => {
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/) && file.type !== 'application/pdf') {
      toast.error('Please upload a JPG, PNG, or PDF file');
      return;
    }

    // Show image preview for non-PDFs
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    setScanState('uploading');
    await new Promise(r => setTimeout(r, 600)); // brief UI pause
    setScanState('scanning');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/student/parse-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data: ScanResult = response.data;

      if (data.error === 'no_key') {
        toast.error(t('scan.no_key'));
        setScanState('error');
        return;
      }

      if (data.error) {
        toast.error(t('scan.error'));
        setScanState('error');
        return;
      }

      setResult(data);
      setScanState('done');
    } catch (err) {
      console.error(err);
      toast.error(t('scan.error'));
      setScanState('error');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleApply = () => {
    if (result?.fields) {
      // Filter out null/undefined values
      const cleanFields: ExtractedFields = {};
      for (const [k, v] of Object.entries(result.fields)) {
        if (v !== null && v !== undefined && v !== '') {
          (cleanFields as any)[k] = v;
        }
      }
      onApply(cleanFields);
      toast.success('Profile fields auto-filled from document!');
      onClose();
    }
  };

  const extractedCount = result?.fields
    ? Object.values(result.fields).filter(v => v !== null && v !== undefined).length
    : 0;

  const confidenceColor = {
    high: 'text-emerald-400 bg-emerald-400/10',
    medium: 'text-yellow-400 bg-yellow-400/10',
    low: 'text-red-400 bg-red-400/10',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-xl">
                  <Scan className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">{t('scan.title')}</h2>
                  <p className="text-sm text-text-secondary mt-0.5">{t('scan.subtitle')}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 text-text-secondary hover:text-text-primary transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">

              {/* Idle / Drop Zone */}
              {(scanState === 'idle' || scanState === 'error') && (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                    dragOver
                      ? 'border-primary bg-primary/10'
                      : 'border-white/20 hover:border-primary/50 hover:bg-white/5'
                  }`}
                  onClick={() => document.getElementById('doc-file-input')?.click()}
                >
                  <input
                    id="doc-file-input"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    onChange={handleFileInput}
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className={`p-4 rounded-2xl transition-all ${dragOver ? 'bg-primary/20' : 'bg-white/5'}`}>
                      <Upload className={`h-10 w-10 ${dragOver ? 'text-primary' : 'text-text-secondary'}`} />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-text-primary">{t('scan.drop_here')}</p>
                      <p className="text-text-secondary text-sm mt-1">{t('scan.or_click')}</p>
                      <div className="flex items-center justify-center gap-2 mt-3">
                        {['JPG', 'PNG', 'PDF'].map(fmt => (
                          <span key={fmt} className="px-2 py-0.5 bg-white/10 rounded-lg text-xs font-mono text-text-secondary">{fmt}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Uploading / Scanning Animation */}
              {(scanState === 'uploading' || scanState === 'scanning') && (
                <div className="text-center py-10">
                  {preview && (
                    <div className="relative mx-auto w-40 h-40 mb-6 rounded-2xl overflow-hidden border border-white/10">
                      <img src={preview} alt="Document" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-primary/30">
                        {/* Scanning line animation */}
                        <motion.div
                          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                          animate={{ top: ['0%', '100%', '0%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        />
                      </div>
                    </div>
                  )}
                  {!preview && (
                    <div className="mx-auto w-20 h-20 mb-6 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 rounded-full border-4 border-white/10 border-t-primary"
                      />
                    </div>
                  )}
                  <p className="text-lg font-semibold text-text-primary">
                    {scanState === 'uploading' ? 'Uploading document...' : t('scan.scanning')}
                  </p>
                  <p className="text-text-secondary text-sm mt-2">
                    {scanState === 'scanning' && 'Gemini Vision is reading your document...'}
                  </p>
                  {/* Progress dots */}
                  <div className="flex justify-center gap-2 mt-4">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {scanState === 'done' && result && (
                <div className="space-y-4">
                  {/* Summary bar */}
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-emerald-400">{extractedCount} fields extracted</p>
                      {result.summary && (
                        <p className="text-sm text-text-secondary mt-0.5">{result.summary}</p>
                      )}
                    </div>
                    {result.confidence && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${confidenceColor[result.confidence]}`}>
                        {t(`scan.${result.confidence}`)} {t('scan.confidence')}
                      </span>
                    )}
                  </div>

                  {/* Extracted fields grid */}
                  {result.fields && (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(result.fields).map(([key, value]) => {
                        if (!value && value !== 0) return null;
                        return (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-3 bg-white/5 border border-white/10 rounded-xl"
                          >
                            <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">
                              {FIELD_LABELS[key] || key}
                            </p>
                            <p className="text-sm font-semibold text-text-primary mt-1 truncate">
                              {key === 'family_income'
                                ? `₹${Number(value).toLocaleString('en-IN')}/year`
                                : String(value)
                              }
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {extractedCount === 0 && (
                    <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      <p className="text-yellow-400 text-sm">No fields could be extracted. Try a clearer image.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3">
              {(scanState === 'done' || scanState === 'error') && (
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-text-primary text-sm transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('scan.scan_again')}
                </button>
              )}
              {scanState === 'idle' && (
                <p className="text-xs text-text-secondary">Documents are processed securely and not stored.</p>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-text-secondary text-sm hover:bg-white/10 transition-all"
                >
                  {t('common.cancel')}
                </button>
                {scanState === 'done' && extractedCount > 0 && (
                  <motion.button
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    onClick={handleApply}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all shadow-lg shadow-primary/20"
                  >
                    <Zap className="h-4 w-4" />
                    {t('scan.apply')}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
