import React, { useState } from 'react';
import {
  Sprout,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  Bookmark,
  CheckCircle2,
  TrendingUp,
  CloudSun,
  Info,
  Check,
  Share2,
  Download,
  Printer
} from 'lucide-react';
import { DiseaseScanResult, LanguageCode } from '../types';
import { translations } from '../utils/translations';

interface DiseaseReportProps {
  report: DiseaseScanResult;
  language: LanguageCode;
  onAskAssistant: (report: DiseaseScanResult) => void;
  onSaveHistory: (report: DiseaseScanResult) => void;
  onNavigateToMarket: (crop: string) => void;
}

export const DiseaseReport: React.FC<DiseaseReportProps> = ({
  report,
  language,
  onAskAssistant,
  onSaveHistory,
  onNavigateToMarket
}) => {
  const t = translations[language];
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSaveHistory(report);
    setIsSaved(true);
  };

  const confidencePct = Math.round(report.confidence * 100);

  return (
    <div className="space-y-6">
      {/* Top Main Diagnosis Hero Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Crop Health Intelligence Report
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold transition-all"
              title="Print Health Report"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSaved
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved to Crop Health History' : 'Save to History'}</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Identified Disease</span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {report.disease}
            </h3>
            <p className="text-xs font-semibold text-emerald-700">{report.crop}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Confidence</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700">{confidencePct}%</span>
              <span className="text-xs text-slate-500 font-semibold">High Accuracy</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${confidencePct}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Severity Level</span>
            <div>
              <span
                className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wide ${
                  report.severity.toLowerCase().includes('high')
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : report.severity.toLowerCase().includes('mod')
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {report.severity} Severity
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Requires monitoring</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Affected Plant Part</span>
            <div className="flex items-center gap-2">
              <span className="text-xl">🍃</span>
              <span className="text-base font-black text-slate-900">{report.affected_area || 'Leaf'}</span>
            </div>
            <p className="text-[11px] text-slate-500">Target area for spray</p>
          </div>
        </div>

        {/* Symptoms and Cause */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Visible Symptoms</span>
            </h4>
            <ul className="space-y-2">
              {report.symptoms.map((sym, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-slate-700 font-medium flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                  <span>{sym}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-600" />
              <span>Biological Cause & Pathogen</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {report.cause}
            </p>
          </div>
        </div>

        {/* Immediate Actions & Treatment */}
        <div className="space-y-4">
          <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Immediate Containment Actions</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {report.immediate_actions.map((act, idx) => (
                <div key={idx} className="bg-white/80 border border-amber-200/60 p-3 rounded-xl text-xs font-semibold text-slate-800 flex items-start gap-2">
                  <span className="font-bold text-amber-700">{idx + 1}.</span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Recommended Treatment Guidance</span>
            </h4>
            
            <div className="space-y-2">
              {report.treatment.map((tr, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span>{tr}</span>
                </div>
              ))}
            </div>

            {/* Mandatory Educational Disclaimer */}
            <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl text-[11px] text-slate-600 font-medium">
              <strong>Educational Disclaimer:</strong> {report.disclaimer || 'Chemical dosages are for educational reference. Consult a certified local agricultural extension officer or agronomist before spraying.'}
            </div>
          </div>
        </div>

        {/* Long-Term Prevention */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Long-Term Prevention & Best Practices</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {report.prevention.map((prev, idx) => (
              <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                <span>{prev}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Farmer Field Monitoring */}
        {report.monitoring && report.monitoring.length > 0 && (
          <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-700" />
              <span>Farmer Field Monitoring & Next Signs</span>
            </h4>
            <div className="space-y-2">
              {report.monitoring.map((mon, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-blue-200/80 text-xs font-medium text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                  <span>{mon}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two Linked Cards: Weather Risk & Market Prices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-emerald-950 text-white p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Weather-Based Risk
              </span>
              <CloudSun className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-emerald-100">
              {report.weather_risk?.disease_risk || 'Moderate'} Risk — High relative humidity favors fungal spore germination.
            </p>
            <p className="text-xs text-emerald-400">
              Optimal Spray Window: 06:00 AM – 09:30 AM
            </p>
          </div>

          <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Current Market Prices ({report.crop})
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-black text-emerald-400">
              ₹2,100 – ₹2,450 / Qtl
            </p>
            <button
              onClick={() => onNavigateToMarket(report.crop)}
              className="text-xs font-bold text-emerald-300 hover:text-white hover:underline flex items-center gap-1"
            >
              <span>View Live Market Prices →</span>
            </button>
          </div>
        </div>

        {/* Ask AI Assistant Footer CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="space-y-0.5 text-center sm:text-left">
            <p className="text-xs font-bold text-slate-800">Have questions about this disease diagnosis?</p>
            <p className="text-[11px] text-slate-500">Ask the AI Farmer Assistant in English, Telugu, or Hindi with voice support.</p>
          </div>

          <button
            onClick={() => onAskAssistant(report)}
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition-all self-stretch sm:self-auto justify-center"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask AI Assistant with Diagnosis</span>
          </button>
        </div>
      </div>
    </div>
  );
};
