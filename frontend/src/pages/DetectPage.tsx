import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Upload,
  Camera,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Info,
  Check,
  X,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Layers,
  Activity
} from 'lucide-react';
import { LanguageCode, DiseaseScanResult, ModelInfo } from '../types';
import { translations } from '../utils/translations';
import { sampleCropImages } from '../utils/sampleImages';
import { api } from '../services/api';
import { DiseaseReport } from '../components/DiseaseReport';

interface DetectPageProps {
  language: LanguageCode;
  onAskAssistant: (report: DiseaseScanResult) => void;
  onSaveHistory: (report: DiseaseScanResult) => void;
  onNavigateToMarket: (crop: string) => void;
}

const CROPS = [
  { id: 'Tomato', nameEn: 'Tomato', nameTe: 'టమాట', nameHi: 'टमाटर', icon: '🍅', color: 'border-red-200 hover:border-red-500 bg-red-50/30' },
  { id: 'Paddy', nameEn: 'Paddy / Rice', nameTe: 'వరి', nameHi: 'धान / चावल', icon: '🌾', color: 'border-emerald-200 hover:border-emerald-500 bg-emerald-50/30' },
  { id: 'Cotton', nameEn: 'Cotton', nameTe: 'పత్తి', nameHi: 'కపాస్', icon: '☁️', color: 'border-blue-200 hover:border-blue-500 bg-blue-50/30' },
  { id: 'Maize', nameEn: 'Maize / Corn', nameTe: 'మొక్కజొన్న', nameHi: 'मक्का', icon: '🌽', color: 'border-amber-200 hover:border-amber-500 bg-amber-50/30' },
  { id: 'Chilli', nameEn: 'Chilli', nameTe: 'మిర్చి', nameHi: 'मिर्च', icon: '🌶️', color: 'border-rose-200 hover:border-rose-500 bg-rose-50/30' },
  { id: 'Potato', nameEn: 'Potato', nameTe: 'బంగాళాదుంప', nameHi: 'आलू', icon: '🥔', color: 'border-yellow-200 hover:border-yellow-500 bg-yellow-50/30' },
];

const PLANT_PARTS = [
  { id: 'Leaf', label: 'Leaf', icon: '🍃', desc: 'Spots, yellowing, wilting, curling' },
  { id: 'Stem', label: 'Stem', icon: '🪵', desc: 'Cankers, lesions, rot, hollow stem' },
  { id: 'Fruit / Boll', label: 'Fruit / Boll', icon: '🍎', desc: 'Rotting, blotches, holes, shedding' },
  { id: 'Grain / Cob', label: 'Grain / Cob', icon: '🌾', desc: 'Discoloration, blast, smut' },
  { id: 'Flower', label: 'Flower', icon: '🌸', desc: 'Drop, blight, thrips damage' },
  { id: 'Root', label: 'Root', icon: '🌱', desc: 'Root rot, wilting, nematodes' },
];

export const DetectPage: React.FC<DetectPageProps> = ({
  language,
  onAskAssistant,
  onSaveHistory,
  onNavigateToMarket
}) => {
  const t = translations[language];

  // 5-Step Workflow State
  const [step, setStep] = useState<number>(1);
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [selectedArea, setSelectedArea] = useState<string>('Leaf');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Scan & Result State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStage, setScanStage] = useState<string>('');
  const [scanResult, setScanResult] = useState<DiseaseScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live Model Information
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [showModelInfo, setShowModelInfo] = useState<boolean>(false);

  useEffect(() => {
    api.getModelInfo()
      .then(info => setModelInfo(info))
      .catch(err => console.log('Could not load model info:', err));
  }, []);

  const startAnalysisWithImage = async (
    fileToScan: File | null,
    cropToScan: string,
    areaToScan: string,
    imgUrl?: string | null
  ) => {
    setStep(4);
    setIsScanning(true);
    setErrorMsg(null);

    try {
      // 4-stage realistic scanning progress reflecting real ML stages
      setScanStage('Stage 1/4: Validating photo quality, illumination & focus...');
      await new Promise(r => setTimeout(r, 400));

      setScanStage('Stage 2/4: LeafValidator running — verifying foliar structure...');
      
      // 15-second request timeout safeguard
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Validation timed out — Please try again')), 15000)
      );

      const fetchPromise = (async () => {
        if (fileToScan) {
          return await api.predictDisease(cropToScan, areaToScan, fileToScan);
        } else if (imgUrl) {
          return await api.predictDiseaseJson(cropToScan, areaToScan, imgUrl);
        } else {
          return await api.predictDisease(cropToScan, areaToScan, undefined);
        }
      })();

      const result = await Promise.race([fetchPromise, timeoutPromise]);

      // Normalize boolean fields (handling boolean types and string representations)
      const isPlantLeaf = result.is_plant_leaf === true || (result as any).is_plant_leaf === 'true' || result.is_leaf === true || (result as any).is_leaf === 'true';
      const isSuccess = result.success === true || (result as any).success === 'true';

      if (!isPlantLeaf || !isSuccess) {
        // NON_PLANT or invalid quality -> go to rejection card immediately
        setScanResult(result);
        setIsScanning(false);
        setStep(5);
        return;
      }

      // Valid leaf detected -> smoothly advance through crop and disease classification
      setScanStage(`Stage 3/4: CropClassifier analyzing ${cropToScan} morphology...`);
      await new Promise(r => setTimeout(r, 450));

      setScanStage('Stage 4/4: DiseaseClassifier scanning foliar lesion patterns...');
      await new Promise(r => setTimeout(r, 450));

      setScanResult(result);
      setIsScanning(false);
      setStep(5);
    } catch (err: any) {
      setIsScanning(false);
      const isTimeout = err.message && err.message.includes('timed out');
      setErrorMsg(isTimeout ? 'Validation timed out — Please try again' : (err.message || 'ML diagnosis failed. Please try again.'));
      setStep(3);
    }
  };

  const handleSelectSample = async (sample: typeof sampleCropImages[0]) => {
    setSelectedCrop(sample.crop);
    setSelectedArea(sample.affected_area || 'Leaf');
    setPreviewUrl(sample.url);
    setErrorMsg(null);

    // Fetch sample image as actual File object to ensure real ML inference execution
    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const sampleFile = new File([blob], `${sample.id}.jpg`, { type: 'image/jpeg' });
      setSelectedImage(sampleFile);
      startAnalysisWithImage(sampleFile, sample.crop, sample.affected_area || 'Leaf', sample.url);
    } catch (e) {
      console.warn("Could not convert sample to file directly, fallback to URL:", e);
      setSelectedImage(null);
      startAnalysisWithImage(null, sample.crop, sample.affected_area || 'Leaf', sample.url);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setErrorMsg(null);
      // Immediately run the ML analysis pipeline so valid leaves never get stuck in waiting
      startAnalysisWithImage(file, selectedCrop, selectedArea, url);
    }
  };

  const handleStartAnalysis = () => {
    startAnalysisWithImage(selectedImage, selectedCrop, selectedArea, previewUrl);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedImage(null);
    setPreviewUrl(null);
    setScanResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>AI Crop Disease Detection</span>
            <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Trained ML Pipeline
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Real deep learning leaf validation, crop identification, and disease diagnostics.
          </p>
        </div>

        {modelInfo && (
          <button
            onClick={() => setShowModelInfo(!showModelInfo)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>{showModelInfo ? 'Hide Model Specs' : 'View ML Model Specs'}</span>
          </button>
        )}
      </div>

      {/* Model Information Drawer Card */}
      {showModelInfo && modelInfo && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">Production ML Architecture Specifications</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
              {modelInfo.last_trained}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Stage 1: Leaf Validator</span>
              <span className="text-emerald-400 font-black text-sm">{modelInfo.leaf_validator.test_accuracy}%</span>
              <span className="text-slate-400 block text-[10px]">Test Accuracy</span>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Stage 2: Crop Classifier</span>
              <span className="text-emerald-400 font-black text-sm">{modelInfo.crop_classifier.test_accuracy}%</span>
              <span className="text-slate-400 block text-[10px]">Test Accuracy</span>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Stage 3: Disease Classifier</span>
              <span className="text-emerald-400 font-black text-sm">{modelInfo.disease_classifier.test_accuracy}%</span>
              <span className="text-slate-400 block text-[10px]">Test Accuracy</span>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Trained Classes</span>
              <span className="text-white font-black text-sm">{modelInfo.num_classes} Disease Classes</span>
              <span className="text-slate-400 block text-[10px]">+ 8 Non-Leaf Classes</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
            <span><strong>Model:</strong> {modelInfo.model_architecture}</span>
            <span><strong>Framework:</strong> {modelInfo.primary_framework}</span>
            <span><strong>Dataset:</strong> {modelInfo.training_dataset}</span>
          </div>
        </div>
      )}

      {/* 5-Step Stepper Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-card">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: '01 Select Crop' },
            { num: 2, label: '02 Plant Part' },
            { num: 3, label: '03 Photo Upload' },
            { num: 4, label: '04 ML Diagnostics' },
            { num: 5, label: '05 Health Report' },
          ].map((s, idx) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;

            return (
              <div key={s.num} className="flex items-center flex-1">
                <button
                  onClick={() => {
                    if (s.num < step) setStep(s.num);
                  }}
                  disabled={s.num > step}
                  className={`flex items-center gap-1.5 sm:gap-2 text-left transition-all ${
                    isActive
                      ? 'text-emerald-800 font-black'
                      : isCompleted
                      ? 'text-emerald-700 font-bold hover:underline'
                      : 'text-slate-400 font-medium'
                  }`}
                >
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className="hidden md:inline text-xs">{s.label}</span>
                </button>
                {idx < 4 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 sm:mx-3 transition-colors ${
                      step > s.num ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: SELECT CROP */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
          <div>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Step 1 of 5
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              Select Crop to Inspect
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Choose the crop for disease classification and tailored agronomic recommendations.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {CROPS.map((c) => {
              const isSelected = selectedCrop === c.id;
              const cropName = language === 'te' ? c.nameTe : language === 'hi' ? c.nameHi : c.nameEn;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCrop(c.id)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer select-none text-center space-y-2 relative ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-200'
                      : `${c.color} hover:shadow-card`
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <div className="text-4xl sm:text-5xl">{c.icon}</div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{cropName}</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">{c.id}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <span>Next: Select Affected Plant Part</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT AFFECTED AREA */}
      {step === 2 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
          <div>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Step 2 of 5
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              Select Affected Plant Part
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Where on the {selectedCrop} plant are you observing disease symptoms?
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {PLANT_PARTS.map((p) => {
              const isSelected = selectedArea === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedArea(p.id)}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer select-none space-y-2 relative ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-200'
                      : 'border-slate-200 hover:border-emerald-400 bg-white hover:shadow-card'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <div className="text-3xl">{p.icon}</div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{p.label}</h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-bold text-xs rounded-xl"
            >
              ← Back to Crops
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <span>Next: Photo Guidance & Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PHOTO GUIDANCE & UPLOAD */}
      {step === 3 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
          <div>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Step 3 of 5
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              Upload or Capture Leaf Photo
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Target crop: <strong>{selectedCrop}</strong> ({selectedArea}). Take a clear photo of the affected plant leaf.
            </p>
          </div>

          {/* Good vs Bad Photo Guidance Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-emerald-900">Recommended Leaf Photo Guideline</p>
                <p className="text-[11px] text-emerald-800 leading-tight">
                  Single crop leaf or foliage, clear focus, natural light, disease spots visible.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-rose-50/70 border border-rose-200/80 p-3 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                <X className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-rose-900">Invalid Non-Leaf (Rejected Automatically)</p>
                <p className="text-[11px] text-rose-800 leading-tight">
                  Pens, phones, humans, soil, vehicles, furniture, screenshots, or severe blur.
                </p>
              </div>
            </div>
          </div>

          {/* Upload & Preview Box */}
          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 sm:p-8 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all">
            {previewUrl ? (
              <div className="space-y-4 max-w-sm mx-auto">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 aspect-video bg-black flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Uploaded Crop Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-emerald-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {selectedCrop} • {selectedArea}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-slate-900/90 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm flex items-center gap-1.5 border border-emerald-500/30">
                    {isScanning ? (
                      <>
                        <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                        <span className="text-amber-300">Validating image...</span>
                      </>
                    ) : scanResult && (scanResult.is_plant_leaf || scanResult.is_leaf) ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Plant leaf detected — analyzing disease...</span>
                      </>
                    ) : scanResult && (!scanResult.is_plant_leaf && !scanResult.is_leaf) ? (
                      <>
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span className="text-rose-300">Invalid Image — No Supported Crop Leaf Detected</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Ready for ML Analysis</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <label className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                    <span>Change Photo</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upload or Capture Leaf Photo</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a high-resolution photo from device or camera
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <label className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    <span>Upload / Take Photo</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Quick Demo Sample Photos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Or Test with Verified Crop Samples:</span>
              <span className="text-[11px] text-slate-400">Loads into real ML pipeline</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sampleCropImages.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(s)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 text-left transition-all flex items-center gap-2"
                >
                  <img src={s.url} alt={s.label} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold text-slate-900 truncate">{s.label}</p>
                    <p className="text-[10px] text-emerald-700">{s.crop} • {s.affected_area}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-bold text-xs rounded-xl"
            >
              ← Back to Plant Part
            </button>
            <button
              onClick={handleStartAnalysis}
              disabled={!previewUrl}
              className={`px-6 py-3 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition-all ${
                previewUrl
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed text-slate-500'
              }`}
            >
              <span>Run Trained ML Analysis</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: AI SCANNING RADAR ANIMATION */}
      {step === 4 && (
        <div className="bg-slate-950 border border-emerald-800/80 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl space-y-6">
          <div className="relative w-48 h-48 mx-auto rounded-full border-2 border-emerald-500/40 flex items-center justify-center overflow-hidden bg-radial-gradient">
            <div className="absolute inset-4 rounded-full border border-emerald-500/30"></div>
            <div className="absolute inset-10 rounded-full border border-emerald-500/20"></div>
            <div className="absolute inset-16 rounded-full border border-emerald-500/10"></div>
            
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-transparent radar-sweep-animation origin-center"></div>

            <div className="relative z-10 w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-400 shadow-glow">
              {previewUrl ? (
                <img src={previewUrl} alt="Crop" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-emerald-900 flex items-center justify-center text-3xl">
                  🌿
                </div>
              )}
              <div className="absolute inset-x-0 h-1 bg-emerald-300 shadow-glow scan-line-animation"></div>
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-600/60 text-emerald-300 text-xs font-black">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Multi-Stage ML Neural Inference Running</span>
            </div>
            <h3 className="text-xl font-black text-white">{scanStage}</h3>
            <p className="text-xs text-slate-400">
              Validating leaf presence & testing for fungal, bacterial, and viral foliar lesions...
            </p>
          </div>
        </div>
      )}

      {/* STEP 5: CENTRAL UNIFIED CROP HEALTH REPORT OR ERROR CARD */}
      {step === 5 && scanResult && (
        <div className="space-y-6">
          {/* REJECTED / INVALID IMAGE CARD (Pen, Mobile, Laptop, Human, Soil, Mismatch, Blurry) */}
          {(!scanResult.success || scanResult.is_leaf === false || scanResult.is_plant_leaf === false) ? (
            <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 sm:p-10 shadow-card space-y-6 text-center max-w-2xl mx-auto animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner border border-rose-200">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  {scanResult.error_type === 'CROP_MISMATCH'
                    ? 'Crop Consistency Mismatch'
                    : scanResult.error_type === 'INSUFFICIENT_QUALITY'
                    ? 'Image Quality Rejected'
                    : 'Invalid Image — No Supported Crop Leaf Detected'}
                </span>
                
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {scanResult.error_type === 'NON_LEAF_DETECTED'
                    ? '❌ Invalid Image'
                    : scanResult.error_type === 'CROP_MISMATCH'
                    ? '⚠ Crop Mismatch Detected'
                    : scanResult.error_type === 'INSUFFICIENT_QUALITY'
                    ? '❌ Image Quality Too Low'
                    : scanResult.title || '❌ Invalid Image for Disease Detection'}
                </h2>
                
                <p className="text-base text-slate-700 font-bold max-w-md mx-auto leading-relaxed">
                  {scanResult.error_type === 'NON_LEAF_DETECTED'
                    ? 'No supported crop leaf was detected.'
                    : scanResult.message || 'The uploaded image does not appear to contain a crop leaf.'}
                </p>

                <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
                  {scanResult.error_type === 'NON_LEAF_DETECTED'
                    ? 'Please upload a clear photo of the affected crop leaf.'
                    : scanResult.suggestion || 'Please provide a clear crop leaf photo in natural light.'}
                </p>
              </div>

              {/* Supported Crops Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Info className="w-4 h-4 text-emerald-600" />
                  <span>Supported Crops:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Tomato 🍅', 'Paddy (Rice) 🌾', 'Cotton ⚪', 'Chilli 🌶️', 'Maize 🌽', 'Potato 🥔'].map((cropName, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700">
                      {cropName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {scanResult.error_type === 'CROP_MISMATCH' && scanResult.detected_crop && (
                  <button
                    onClick={() => {
                      setSelectedCrop(scanResult.detected_crop!);
                      handleStartAnalysis();
                    }}
                    className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Switch to {scanResult.detected_crop} & Re-Analyze</span>
                  </button>
                )}
                
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Change Photo</span>
                </button>
                
                <button
                  onClick={() => setStep(3)}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
                >
                  <span>Re-upload Leaf</span>
                </button>
              </div>
            </div>
          ) : (
            /* SUCCESSFUL PREDICTION: CROP HEALTH INTELLIGENCE REPORT */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Another Crop</span>
                </button>
                {scanResult.is_plant_leaf && scanResult.success && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Valid Image — Plant/Leaf Detected</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Trained Model Diagnosis Confirmed</span>
                    </span>
                  </div>
                )}
              </div>

              <DiseaseReport
                report={scanResult}
                language={language}
                onAskAssistant={onAskAssistant}
                onSaveHistory={onSaveHistory}
                onNavigateToMarket={onNavigateToMarket}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
