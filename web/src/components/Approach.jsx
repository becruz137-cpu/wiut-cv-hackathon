import React from 'react';
import { Cpu, Eye, GitBranch, Shield, Zap, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Approach() {
  const pipelineSteps = [
    {
      num: '01',
      title: 'Decoded Frame Streaming',
      sub: 'OpenCV cv2.VideoCapture',
      desc: 'Streams CCTV footage with temporal stride sampling (k=3), reducing compute overhead by 66% while preserving 10Hz temporal resolution for sub-second event boundaries.'
    },
    {
      num: '02',
      title: 'Neural Object Detection',
      sub: 'YOLOv8 Nano (Open Weights)',
      desc: 'Extracts bounding boxes and confidence scores for road participants (cars, buses, trucks, motorcycles, pedestrians) using optimized COCO feature representations.'
    },
    {
      num: '03',
      title: 'Trajectory Tracking',
      sub: 'ByteTrack Multi-Object Association',
      desc: 'Maintains temporal object identities across frames via Kalman filter state predictions, linking high and low score detections to prevent identity switches through partial occlusions.'
    },
    {
      num: '04',
      title: 'Spatio-Temporal Gating Engine',
      sub: 'Deterministic Heuristic Rules',
      desc: 'Translates raw trajectory vectors, speed distributions, and spatial roadway zones into instantaneous per-frame violation flags across all 14 official classes.'
    },
    {
      num: '05',
      title: 'Anti-Flicker & Boundary Merge',
      sub: 'Temporal Filter & Post-Processing',
      desc: 'Requires consecutive positive frames (MIN_CONSEC) before asserting an event, drops micro-blips (< 1s), and coalesces gaps (< 2s) to maximize temporal IoU.'
    }
  ];

  return (
    <section id="approach" className="py-16 border-t border-slate-800/60 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mb-12">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-1">
          <Layers className="w-4 h-4" />
          Technical Methodology (15% Weight)
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Pipeline Architecture & Engineering Approach
        </h2>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          Designed for maximum reproducible precision and zero out-of-budget risk. The system combines open-weight neural detectors with deterministic temporal state machines.
        </p>
      </div>

      {/* Interactive Architecture Flow */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-14">
        {pipelineSteps.map((step, idx) => (
          <div
            key={step.num}
            className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group relative"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-black text-slate-700 group-hover:text-cyan-400 transition-colors font-mono">
                  {step.num}
                </span>
                <span className="w-2 h-2 rounded-full bg-cyan-500/40 group-hover:bg-cyan-400 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{step.title}</h4>
              <div className="text-[11px] font-mono text-cyan-400 mb-2">{step.sub}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
            
            {idx < pipelineSteps.length - 1 && (
              <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Breakdown: Learned vs Rule-Based */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Learned Component */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">What is Learned (Neural Networks)</h3>
              <p className="text-xs text-slate-400">Open-weight vision backbones</p>
            </div>
          </div>

          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Object Class Identification:</strong> Distinguishing cars, motorcycles, trucks, buses, and pedestrians across lighting conditions without manual color/edge hand-crafting.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Multi-Scale Spatial Localization:</strong> Extracting bounding coordinates with high intersection-over-union fidelity across distant and close perspective camera zones.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Feature Invariance:</strong> Resilience to headlight glare, surface reflections, asphalt texture variations, and environmental shadows.
              </div>
            </li>
          </ul>
        </div>

        {/* Rule-Based Component */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">What is Rule-Based (Deterministic Physics)</h3>
              <p className="text-xs text-slate-400">Temporal state machines & geometry</p>
            </div>
          </div>

          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Stopped Vehicle Thresholds:</strong> Cumulative stationary condition tracking over 10 consecutive seconds (&lt; 2.0 px/frame) to prevent triggering on transient traffic pauses.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Spatio-Temporal Road Geofencing:</strong> Delineating roadway boundaries to isolate pedestrian jaywalking from sidewalk transit.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Temporal IoU Boundary Shaping:</strong> Consecutive positive frame counters (MIN_CONSEC) eliminate spurious 1-frame false alarms that corrupt F1 score.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
