import React from 'react';
import { Shield, Heart } from 'lucide-react';
import { GithubIcon } from './Icons';


export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-wide">BITSTORM</div>
            <div className="text-[11px] text-slate-500">WIUT Hackathon 2026 • Computer Vision Elimination Track</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/becruz137-cpu/wiut-cv-hackathon"
            target="_blank"
            rel="noreferrer"
            className="hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub</span>
          </a>
          <span className="text-slate-700">|</span>
          <span>Open-Weights & Reproducible</span>
        </div>
      </div>
    </footer>
  );
}
