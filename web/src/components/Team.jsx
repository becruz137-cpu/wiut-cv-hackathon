import { Users, ExternalLink, Code2, Award, Sparkles } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';

export default function Team() {
  const members = [
    {
      name: 'Team Captain',
      handle: 'becruz137-cpu',
      role: 'Team Captain & Lead ML/CV Engineer',
      focus: 'Computer Vision & Deep Learning',
      bio: 'Architected the core end-to-end traffic event detection pipeline. Integrated YOLOv8n neural weights with ByteTrack association, designed the spatio-temporal rule gating engine, and optimized temporal IoU boundaries to eliminate false alarms.',
      contributions: [
        'End-to-end pipeline implementation (solution.py)',
        'YOLOv8n object detection & ByteTrack tracking integration',
        'Deterministic rule heuristics (stopped vehicle, jaywalking, collision IoU)',
        'Temporal stride downsampling & runtime budget optimization'
      ],
      projects: [
        'Autonomous Edge Vehicle Tracking System',
        'Multi-Target Spatio-Temporal Event Classifier'
      ],
      github: 'https://github.com/becruz137-cpu',
      linkedin: '#'
    },
    {
      name: 'Frontend & Systems Lead',
      handle: 'teammate-2',
      role: 'Full-Stack & UX Engineer',
      focus: 'Web Systems & Interactive Analytics',
      bio: 'Engineered the team evaluation website, interactive video playback timeline scrubber, real-time client inference simulator, and responsive operator UI according to the official hackathon rubrics.',
      contributions: [
        'Interactive timeline scrubber with video timestamp seek synchronization',
        'Client-side video upload interface & predictions exporter',
        'Responsive dark-mode UI design with mobile optimization',
        'Real-time event HUD and operator violation alert feeds'
      ],
      projects: [
        'Real-time IoT Telemetry Streamer',
        'High-Performance WebGL Video Analytics Player'
      ],
      github: 'https://github.com',
      linkedin: '#'
    },
    {
      name: 'Data & Benchmark Lead',
      handle: 'teammate-3',
      role: 'Data & Systems Evaluation Engineer',
      focus: 'Evaluation Engineering & EDA',
      bio: 'Conducted comprehensive exploratory data analysis (EDA) of the CCTV footage, audited camera perspective foreshortening, verified metric adherence with evaluate.py, and profiled hardware runtime budgets.',
      contributions: [
        'Sample CCTV footage statistical profiling & density analysis',
        'Temporal IoU format compliance auditing (evaluate.py)',
        'False alarm error analysis & threshold validation',
        'Hardware execution profiling under 3.0× time budget cutoff'
      ],
      projects: [
        'Automated Machine Learning Benchmark Harness',
        'Urban Roadside Traffic Flow Synthesizer'
      ],
      github: 'https://github.com',
      linkedin: '#'
    }
  ];

  return (
    <section id="team" className="py-16 border-t border-slate-800/60 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mb-12">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-1">
          <Users className="w-4 h-4" />
          Engineering Roster (10% Weight)
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          The Engineering Squad
        </h2>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          Three dedicated engineering roles covering model architecture, full-stack product interfaces, and benchmark evaluation integrity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {members.map((member, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 flex items-center justify-center font-bold text-lg text-white font-mono">
                  0{idx + 1}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-0.5">{member.name}</h3>
              <div className="text-xs font-semibold text-cyan-400 mb-2">{member.role}</div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{member.bio}</p>

              {/* Contributions */}
              <div className="mb-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5 font-bold">
                  Core Contributions
                </span>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {member.contributions.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Past projects */}
            <div className="pt-4 border-t border-slate-800/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1 font-bold">
                Featured Prior Work
              </span>
              <div className="flex flex-wrap gap-1.5">
                {member.projects.map((p, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 text-[10px]">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
