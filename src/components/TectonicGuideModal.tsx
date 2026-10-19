import React from 'react';
import { X, Globe2, ShieldAlert, BookOpen, Layers, Flame } from 'lucide-react';

interface TectonicGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TectonicGuideModal: React.FC<TectonicGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Myanmar Active Tectonics & Seismicity Guide
              </h2>
              <p className="text-[11px] text-slate-400">
                Geological framework of the Indo-Burman Wedge & Sagaing Fault System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Tedim Quake Context */}
          <div className="p-3.5 bg-rose-950/30 border border-rose-900/50 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wide">
              <Flame className="w-4 h-4 text-rose-500" />
              Tectonic Context of the Tedim Earthquake (19.10.2026 M3.7)
            </div>
            <p>
              The epicenter at <span className="font-mono text-white font-medium">23.38° N, 93.52° E</span> lies about 9 miles west of Tedim in Chin State, near the Myanmar-India border (Mizoram). This zone belongs to the <strong>Indo-Burman Accretionary Wedge</strong>, formed by highly oblique eastward subduction of the Indian oceanic/continental lithosphere beneath the Burma Microplate.
            </p>
            <p className="text-[11px] text-slate-400">
              The shallow focal depth of 12 km reflects active crustal contraction and strike-slip partitioning along thrust sheets and the Churachandpur-Mao / Kabaw fault systems.
            </p>
          </div>

          {/* Major Systems */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Major Active Fault Systems in Myanmar
            </h3>

            {/* Sagaing Fault */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-400">1. Sagaing Fault (Dextral Strike-Slip)</span>
                <span className="text-[10px] font-mono bg-rose-950/50 text-rose-300 px-2 py-0.5 rounded">
                  ~18 - 20 mm/yr Slip Rate
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                A major continental transform fault extending &gt;1,200 km from the Andaman Sea rift in the south to the eastern Himalayan syntaxis in the north. It passes through major urban centers including Nay Pyi Taw, Mandalay, Taungoo, and Bago, posing substantial seismic hazard.
              </p>
            </div>

            {/* Indo-Burman Wedge */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-400">2. Indo-Burman Wedge & Kabaw Fault</span>
                <span className="text-[10px] font-mono bg-purple-950/50 text-purple-300 px-2 py-0.5 rounded">
                  Compressional / Oblique
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                The western mountain ranges (Chin Hills, Naga Hills, Arakan Yoma) accommodate shortening between India and Eurasia. The Kabaw Fault marks the tectonic boundary between the accretionary wedge and the Central Myanmar Basin.
              </p>
            </div>

            {/* Shan Plateau */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">3. Shan Plateau & Kyaukkyan Fault</span>
                <span className="text-[10px] font-mono bg-amber-950/50 text-amber-300 px-2 py-0.5 rounded">
                  Left-Lateral / Extensional
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Features active sinistral strike-slip faults accommodating the eastward extrusion of Indochina. Hosted the historic 1912 Maymyo (Pyin Oo Lwin) M7.7 earthquake.
              </p>
            </div>

            {/* Andaman Sea */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400">4. Andaman Sea Extensional Basin</span>
                <span className="text-[10px] font-mono bg-cyan-950/50 text-cyan-300 px-2 py-0.5 rounded">
                  Spreading Ridge & Transform
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Back-arc spreading center that connects the Sumatra Fault with the Sagaing Fault system via active oceanic spreading ridges and transform faults.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
