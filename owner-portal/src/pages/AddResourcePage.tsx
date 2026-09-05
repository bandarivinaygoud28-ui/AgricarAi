import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  UploadCloud,
  X,
  RefreshCw,
  Link,
  CheckCircle2,
  AlertCircle,
  FileImage
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LocationPicker } from '../components/Common/LocationPicker';

interface AddResourcePageProps {
  editResourceId?: number | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const RESOURCE_TYPES = [
  { id: 'Tractor', label: 'Tractor', icon: '🚜', defaultPrice: 800, unit: 'hour', defaultImage: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80' },
  { id: 'JCB / Earthmover', label: 'JCB / Earthmover', icon: '🚜', defaultPrice: 1500, unit: 'hour', defaultImage: 'https://images.unsplash.com/photo-1579412690850-bd41cd0af397?w=800&auto=format&fit=crop&q=80' },
  { id: 'Harvester', label: 'Combine Harvester', icon: '🌾', defaultPrice: 2200, unit: 'hour', defaultImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80' },
  { id: 'Agricultural Drone', label: 'Agricultural Drone', icon: '🛩️', defaultPrice: 600, unit: 'acre', defaultImage: 'https://images.unsplash.com/photo-1506947411487-a56738267384?w=800&auto=format&fit=crop&q=80' },
  { id: 'Sprayer', label: 'Power Sprayer', icon: '🧪', defaultPrice: 400, unit: 'hour', defaultImage: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&auto=format&fit=crop&q=80' },
  { id: 'Seed Sowing Machine', label: 'Seed Sowing Machine', icon: '🌱', defaultPrice: 700, unit: 'acre', defaultImage: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=800&auto=format&fit=crop&q=80' },
  { id: 'Water Pump', label: 'Diesel Water Pump', icon: '💧', defaultPrice: 350, unit: 'hour', defaultImage: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80' },
  { id: 'Farm Transport', label: 'Farm Transport Vehicle', icon: '🚚', defaultPrice: 800, unit: 'trip', defaultImage: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80' },
  { id: 'Other Farm Machinery', label: 'Other Farm Machinery', icon: '🛠️', defaultPrice: 600, unit: 'hour', defaultImage: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80' }
];

export const AddResourcePage: React.FC<AddResourcePageProps> = ({
  editResourceId,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resourceType, setResourceType] = useState<string>('Tractor');
  const [title, setTitle] = useState<string>('');
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [year, setYear] = useState<string>('2024');
  const [description, setDescription] = useState<string>('');

  // Image Upload State
  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80'
  );
  const [imagePreview, setImagePreview] = useState<string>(
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80'
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedFileSize, setSelectedFileSize] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string>('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');

  // Pricing
  const [pricePerHour, setPricePerHour] = useState<number>(800);
  const [pricePerDay, setPricePerDay] = useState<number>(6400);
  const [pricePerAcre, setPricePerAcre] = useState<number>(950);
  const [pricePerTrip, setPricePerTrip] = useState<number>(0);
  const [priceUnit, setPriceUnit] = useState<string>('hour');

  // Location
  const [village, setVillage] = useState<string>(user?.village || 'Kummarguda');
  const [mandal, setMandal] = useState<string>(user?.mandal || 'Shamshabad');
  const [district, setDistrict] = useState<string>(user?.district || 'Ranga Reddy');
  const [state, setState] = useState<string>(user?.state || 'Telangana');
  const [latitude, setLatitude] = useState<number>(user?.latitude || 17.2285);
  const [longitude, setLongitude] = useState<number>(user?.longitude || 78.4312);

  const [availability, setAvailability] = useState<string>('Available');
  const [specs, setSpecs] = useState<string>('');
  const [terms, setTerms] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const getDefaultImageForType = (typeId: string): string => {
    const found = RESOURCE_TYPES.find((t) => t.id === typeId);
    return (
      found?.defaultImage ||
      'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80'
    );
  };

  useEffect(() => {
    if (editResourceId) {
      // Fetch resource details for editing
      api.getMyResources().then((list) => {
        const found = list.find((r) => r.id === editResourceId);
        if (found) {
          setTitle(found.title || (found as any).name || '');
          setResourceType(found.resource_type || (found as any).type || 'Tractor');
          setVehicleNumber((found as any).vehicle_number || '');
          setModel((found as any).model || '');
          setYear((found as any).year || '2024');
          setDescription(found.description || '');
          const img = found.image_url || found.image || getDefaultImageForType(found.resource_type || 'Tractor');
          setImageUrl(img);
          setImagePreview(img);
          setPricePerHour(Number(found.price_per_hour || found.price || 800));
          setPricePerDay(Number(found.price_per_day || (found.price ? found.price * 8 : 6400)));
          setPricePerAcre(Number(found.price_per_acre || 0));
          setPricePerTrip(Number((found as any).price_per_trip || 0));
          setPriceUnit(found.price_unit || 'hour');
          setVillage(found.village || user?.village || 'Kummarguda');
          setMandal((found as any).mandal || user?.mandal || 'Shamshabad');
          setDistrict(found.district || user?.district || 'Ranga Reddy');
          setState(found.state || user?.state || 'Telangana');
          setLatitude(found.latitude || user?.latitude || 17.2285);
          setLongitude(found.longitude || user?.longitude || 78.4312);
          setAvailability(found.availability || 'Available');
          setSpecs(found.specs || '');
          setTerms(found.terms || '');
        }
      });
    }
  }, [editResourceId]);

  const handleTypeSelect = (t: (typeof RESOURCE_TYPES)[0]) => {
    setResourceType(t.id);
    setPricePerHour(t.defaultPrice);
    setPricePerDay(t.defaultPrice * 8);
    setPriceUnit(t.unit);

    // If no custom user file was uploaded, update preview to match default of the new category
    if (!selectedFile && imageMode === 'upload') {
      setImageUrl(t.defaultImage);
      setImagePreview(t.defaultImage);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validate File Type
    if (!file.type.startsWith('image/')) {
      setImageError('Invalid file format. Only image files (JPEG, PNG, WEBP, GIF) are allowed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Validate File Size (5 MB = 5 * 1024 * 1024 bytes)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setImageError(`Image is too large (${sizeMb} MB). Maximum allowed file size is 5 MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 3. Format file size display
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setSelectedFile(file);
    setSelectedFileName(file.name);
    setSelectedFileSize(formattedSize);

    // 4. Generate local instant preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // 5. Upload to backend
    try {
      setIsUploadingImage(true);
      const uploadRes = await api.uploadImage(file);
      if (uploadRes.image_url) {
        setImageUrl(uploadRes.image_url);
      }
    } catch (err: any) {
      console.warn('Backend upload notice, using preview URL:', err.message);
      // Fallback: convert file to Base64 data URL so it persists even if backend is temporarily offline
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setSelectedFileName('');
    setSelectedFileSize('');
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    const defaultImg = getDefaultImageForType(resourceType);
    setImageUrl(defaultImg);
    setImagePreview(defaultImg);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const finalImage = imageUrl || imagePreview || getDefaultImageForType(resourceType);

    const payload = {
      title,
      name: title,
      resource_type: resourceType,
      type: resourceType,
      vehicle_number: vehicleNumber,
      model,
      year,
      description,
      image_url: finalImage,
      image: finalImage,
      price_per_hour: Number(pricePerHour),
      price_per_day: Number(pricePerDay),
      price_per_acre: Number(pricePerAcre),
      price_per_trip: Number(pricePerTrip),
      price_unit: priceUnit,
      village,
      mandal,
      district,
      state,
      location: `${village}, ${district}, ${state}`,
      latitude: Number(latitude),
      longitude: Number(longitude),
      availability,
      specs,
      terms
    };

    try {
      if (editResourceId) {
        await api.updateResource(editResourceId, payload);
      } else {
        await api.addResource(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save resource. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Resources</span>
        </button>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
          {editResourceId ? '✏️ Edit Equipment' : '➕ List New Machinery'}
        </span>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-800/40">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {editResourceId ? 'Update Machinery Specifications' : 'List Agricultural Equipment'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
          Add full machine details, upload machine photos, set rental rates, GPS base location, and live availability.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Resource Type Selector */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
            1. Select Agricultural Equipment Type
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {RESOURCE_TYPES.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => handleTypeSelect(t)}
                className={`p-3 rounded-2xl text-left border transition-all flex items-center gap-3 ${
                  resourceType === t.id
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-2xl">{t.icon}</span>
                <div className="min-w-0">
                  <h4 className="text-xs font-black truncate">{t.label}</h4>
                  <p className="text-[10px] text-emerald-400 font-bold">
                    ₹{t.defaultPrice} /{t.unit}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Machine Specifications & Resource Image */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
            2. Machinery Name & Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Resource Name / Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Mahindra 575 DI (45 HP) Tractor"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Vehicle / Machine Number *
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                required
                placeholder="e.g. TS 03 AB 4591"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Model & Year
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Sarpanch 4WD"
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:border-emerald-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2024"
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Description & Attachments
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details on attachments, rotavators, cultivators, water pump capacity, etc."
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-medium focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* ============================================================ */}
            {/* IMPROVED: RESOURCE IMAGE SECTION */}
            {/* ============================================================ */}
            <div className="sm:col-span-2 space-y-3 pt-2 border-t border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>Resource Image</span>
                  </label>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Upload a real photo of your agricultural machinery (Max 5 MB, JPG/PNG/WEBP).
                  </p>
                </div>

                {/* Optional Fallback Mode Switcher */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      imageMode === 'upload'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📁 Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      imageMode === 'url'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🔗 Image URL
                  </button>
                </div>
              </div>

              {imageError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{imageError}</span>
                </div>
              )}

              {imageMode === 'upload' ? (
                <div className="space-y-3">
                  {/* Upload Dropzone / Trigger Area */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border-2 border-dashed border-slate-700 hover:border-emerald-500/60 transition-all">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="resource-file-input"
                    />

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Interactive Upload Box */}
                      <div className="flex-1 text-center sm:text-left space-y-1">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <UploadCloud className="w-5 h-5 text-emerald-400 animate-pulse" />
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            Upload Resource Image
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Select a clear photo from your computer or phone camera.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-950 transition-all flex items-center gap-1.5"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>{selectedFile ? 'Choose Another Image' : 'Choose Image'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Image Preview & File Meta Bar */}
                  {imagePreview && (
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                          <img
                            src={imagePreview}
                            alt="Machinery Preview"
                            className="w-full h-full object-cover"
                          />
                          {isUploadingImage && (
                            <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                              <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-white truncate block">
                              {selectedFileName || `${resourceType} Machinery Photo`}
                            </span>
                            {selectedFile && (
                              <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                                Uploaded
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {selectedFileSize ? (
                              <span>File Size: <strong className="text-slate-300">{selectedFileSize}</strong></span>
                            ) : (
                              <span className="text-slate-500">Default machinery preview</span>
                            )}
                          </span>

                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Will be displayed to farmers in Marketplace</span>
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
                        >
                          Replace
                        </button>

                        {(selectedFile || imageUrl !== getDefaultImageForType(resourceType)) && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Fallback Image URL Mode */
                <div className="space-y-3">
                  <div className="relative">
                    <Link className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {imageUrl && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt="URL Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getDefaultImageForType(resourceType);
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-white block truncate">
                          External Image URL Active
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {imageUrl}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* ============================================================ */}
          </div>
        </div>

        {/* Step 3: Pricing Structure */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
              3. Set Rental Rates
            </h3>
            <span className="text-[11px] text-amber-400 font-bold">
              AgriCare Platform Fee: 5%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Price per Hour (₹) *
              </label>
              <input
                type="number"
                min={0}
                value={pricePerHour}
                onChange={(e) => setPricePerHour(Number(e.target.value))}
                required
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-emerald-400 font-black focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">e.g. ₹800/hr (Tractor)</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Price per Day (₹)
              </label>
              <input
                type="number"
                min={0}
                value={pricePerDay}
                onChange={(e) => setPricePerDay(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-black focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">8 hrs standard</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Price per Acre (₹)
              </label>
              <input
                type="number"
                min={0}
                value={pricePerAcre}
                onChange={(e) => setPricePerAcre(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-black focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">e.g. ₹600/acre (Drone)</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Price per Trip (₹)
              </label>
              <input
                type="number"
                min={0}
                value={pricePerTrip}
                onChange={(e) => setPricePerTrip(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-black focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">e.g. ₹800/trip</span>
            </div>
          </div>
        </div>

        {/* Step 4: Location & GPS Geolocation */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
            4. Machine Base Location & GPS Coordinates
          </h3>

          <LocationPicker
            village={village}
            mandal={mandal}
            district={district}
            state={state}
            latitude={latitude}
            longitude={longitude}
            onChange={(fields) => {
              setVillage(fields.village);
              setMandal(fields.mandal);
              setDistrict(fields.district);
              setState(fields.state);
              setLatitude(fields.latitude);
              setLongitude(fields.longitude);
            }}
          />
        </div>

        {/* Step 5: Availability Status */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
            5. Initial Availability Status
          </h3>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-2xl bg-slate-800 border border-slate-700 hover:border-emerald-500 transition-all flex-1">
              <input
                type="radio"
                name="avail"
                checked={availability === 'Available'}
                onChange={() => setAvailability('Available')}
                className="text-emerald-500 focus:ring-0"
              />
              <div>
                <span className="text-xs font-bold text-white block">🟢 Available</span>
                <span className="text-[10px] text-slate-400">Open for immediate booking by farmers</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-2xl bg-slate-800 border border-slate-700 hover:border-amber-500 transition-all flex-1">
              <input
                type="radio"
                name="avail"
                checked={availability === 'Unavailable'}
                onChange={() => setAvailability('Unavailable')}
                className="text-amber-500 focus:ring-0"
              />
              <div>
                <span className="text-xs font-bold text-white block">🔴 Unavailable</span>
                <span className="text-[10px] text-slate-400">Temporarily busy or under maintenance</span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black shadow-xl shadow-emerald-950 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving to Database...' : editResourceId ? 'Update Machinery' : 'Publish Resource Live'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
