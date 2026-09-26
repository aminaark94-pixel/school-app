import React, { useState } from 'react';
import { Palette, Image as ImageIcon, Save, CheckCircle2, Building, RefreshCw } from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { useSkin } from '../../hooks/useSkin';

const COLOR_PRESETS = [
  { name: 'Ideas Schooling System', primary: '#0C1F38', secondary: '#F02434' },
  { name: 'High Star Public Secondary School', primary: '#0A2540', secondary: '#F5B800' },
  { name: 'The Leading Schooling System', primary: '#312E81', secondary: '#F59E0B' },
  { name: 'Premium Branding', primary: '#8B0000', secondary: '#D4AF37' },
];

const LOGO_PRESETS = [
  {
    name: 'Academic Shield',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
  },
  {
    name: 'STEM Compass',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=160&auto=format&fit=crop&q=80',
  },
  {
    name: 'Classic University',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=160&auto=format&fit=crop&q=80',
  },
];

export const SchoolBrandingSettings: React.FC = () => {
  const { currentSchool, updateSchoolBranding } = useSchoolData();
  const skin = useSkin();

  const [name, setName] = useState(currentSchool?.name || '');
  const [motto, setMotto] = useState(currentSchool?.motto || '');
  const [logoUrl, setLogoUrl] = useState(currentSchool?.logo_url || '');
  const [primaryColor, setPrimaryColor] = useState(currentSchool?.primary_color || '#8B0000');
  const [secondaryColor, setSecondaryColor] = useState(currentSchool?.secondary_color || '#D4AF37');
  const [address, setAddress] = useState(currentSchool?.address || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;

    updateSchoolBranding(currentSchool.id, {
      name,
      motto,
      logo_url: logoUrl,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      address,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h3 className="text-base font-bold text-slate-900">
          {skin.name} — School Branding
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Update your school name, logo, colours, and institutional details. Changes update the portal and official report card.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Branding preferences successfully updated and applied!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              School / Institution Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              School Motto / Slogan
            </label>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Address & Contact Info
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Logo URL and File Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              School Crest / Logo
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-mono text-xs"
              />

              <div className="flex items-center gap-2 text-xs">
                <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 font-medium text-slate-700 transition flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Upload Local Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-slate-400">or pick preset:</span>
                {LOGO_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLogoUrl(p.url)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color Palettes */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Theme Color Scheme
            </label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Primary Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Secondary Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              {COLOR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrimaryColor(preset.primary);
                    setSecondaryColor(preset.secondary);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  <span
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Branding Preview */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Live Preview (Report Card & Portal Header)
          </label>
          <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200 space-y-4">
            {/* Header Mock */}
            <div
              className="p-4 rounded-xl text-white shadow-sm flex items-center justify-between"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="preview logo"
                    className="w-10 h-10 rounded-xl object-cover border border-white/30"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    ED
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm tracking-tight">{name || 'School Name'}</h4>
                  <p className="text-[11px] opacity-80 italic">{motto || 'Motto'}</p>
                </div>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-xs"
                style={{ backgroundColor: secondaryColor }}
              >
                Tenant Active
              </span>
            </div>

            {/* Document Header Mock */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: primaryColor }}>
                <span className="font-bold" style={{ color: primaryColor }}>
                  {name || 'School Name'}
                </span>
                <span className="text-[10px] text-slate-400">Official Report Card</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Sample Student</span>
                <span className="font-bold" style={{ color: secondaryColor }}>
                  Grade: A+ (Distinction)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              id="save-branding-btn"
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-2xl bg-[#8B0000] hover:bg-[#700000] text-[#EDE7C7] border border-[#D4AF37]/50 shadow-md transition active:scale-95 cursor-pointer font-['Cinzel',serif]"
            >
              <Save className="w-4 h-4 text-[#D4AF37]" />
              <span>Save & Apply {skin.name}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
