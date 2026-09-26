import React, { useState } from 'react';
import { Shield, Cpu, Activity, Video, Users, FileText, ExternalLink, Menu, X } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function Navbar({ activeSection, setActiveSection }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'demo', label: 'Live Demo', icon: Video },
    { id: 'results', label: 'Sample Results', icon: Activity },
    { id: 'eda', label: 'EDA Insights', icon: Cpu },
    { id: 'approach', label: 'Pipeline Architecture', icon: Shield },
    { id: 'team', label: 'Engineering Team', icon: Users },
    { id: 'report', label: 'Technical Report', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide text-base">SENTINEL-CV</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                WIUT 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Autonomous Fixed CCTV Traffic Intelligence</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600/20 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action button */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://github.com/becruz137-cpu/wiut-cv-hackathon"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors shadow-sm"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setMobileMenuOpen(false);
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-900 hover:text-cyan-400 flex items-center gap-2"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
          <a
            href="https://github.com/becruz137-cpu/wiut-cv-hackathon"
            target="_blank"
            rel="noreferrer"
            className="w-full mt-2 text-center text-xs font-semibold px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700/80 flex items-center justify-center gap-2"
          >
            <GithubIcon className="w-4 h-4" />
            <span>View on GitHub</span>
          </a>
        </div>
      )}
    </header>
  );
}
