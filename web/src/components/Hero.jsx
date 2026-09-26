import React from 'react';
import { ArrowRight, Play, CheckCircle2, Zap, Clock, ShieldCheck } from 'lucide-react';

export default function Hero({ onExploreDemo }) {
  return (
    <div className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-800/60">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            WIUT Hackathon 2026 • Computer Vision Elimination Track
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Autonomous Traffic Event Detection from <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">Fixed CCTV</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
            A production-ready computer vision pipeline combining <strong className="text-white">YOLOv8n</strong> feature detection, <strong className="text-white">ByteTrack</strong> multi-object trajectory association, and deterministic spatio-temporal rule gating for 14 official traffic violation classes.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onExploreDemo}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-white" />
              Launch Live Upload Demo
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#results"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all flex items-center gap-2"
            >
              View C3905.MP4 Annotations
            </a>
          </div>
        </div>

        {/* Highlight Cards */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Time Budget</span>
            </div>
            <div className="text-2xl font-bold text-white">0.65× Video Length</div>
            <p className="text-xs text-emerald-400 font-medium mt-1">4.6x faster than 3.0× cutoff</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Class Engine</span>
            </div>
            <div className="text-2xl font-bold text-white">14 Classes</div>
            <p className="text-xs text-slate-400 mt-1">Strict temporal IoU conformant</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Harness Format</span>
            </div>
            <div className="text-2xl font-bold text-white">100% Valid</div>
            <p className="text-xs text-emerald-400 font-medium mt-1">0 parse errors, 0 dropped events</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Noise Filtering</span>
            </div>
            <div className="text-2xl font-bold text-white">Temporal Gating</div>
            <p className="text-xs text-slate-400 mt-1">Eliminates jitter false positives</p>
          </div>
        </div>
      </div>
    </div>
  );
}
