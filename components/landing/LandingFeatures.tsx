import React from "react";
import { TrendingUp, GitFork, Navigation, LayoutGrid, Calendar, Cpu } from "lucide-react";
import { TOTAL_MCP_TOOLS_COUNT } from "@/src/config/chat-limits";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "AI Seat Confirmation Probability",
    description: "Evaluates historical waitlist confirmation trends, quota pools, and seasonal spikes to forecast whether your RAC/WL ticket will get confirmed.",
    tag: "High Accuracy",
    color: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
  },
  {
    icon: GitFork,
    title: "2-Leg Connecting Break Journeys",
    description: "Direct train completely sold out? ConfirmRoute automatically discovers viable 2-leg routes via intermediate junctions with comfortable layover buffers.",
    tag: "Smart Routing",
    color: "from-indigo-500/20 to-violet-500/10",
    border: "border-indigo-500/30",
    iconColor: "text-indigo-400",
  },
  {
    icon: Navigation,
    title: "Live Running Status & Delays",
    description: "Real-time train location, platform predictions, delay histories, and station-by-station arrival updates powered by official railway feeds.",
    tag: "Sub-Second Feeds",
    color: "from-cyan-500/20 to-blue-500/10",
    border: "border-cyan-500/30",
    iconColor: "text-cyan-400",
  },
  {
    icon: LayoutGrid,
    title: "Last-Minute Chart Vacant Berths",
    description: "Finds unoccupied berths and coupe seats released after IRCTC chart preparation, available for immediate Current Booking at normal fare.",
    tag: "Current Booking",
    color: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/30",
    iconColor: "text-amber-400",
  },
  {
    icon: Calendar,
    title: "60-Day Availability Calendar",
    description: "Visualizes comprehensive availability across 2 full months in a single heat-mapped calendar, highlighting peak vs low-demand travel days.",
    tag: "Trend Intelligence",
    color: "from-fuchsia-500/20 to-pink-500/10",
    border: "border-fuchsia-500/30",
    iconColor: "text-fuchsia-400",
  },
  {
    icon: Cpu,
    title: "Developer MCP Tool Server",
    description: `Integrate all ${TOTAL_MCP_TOOLS_COUNT} Indian Railways intelligence tools directly into Cursor, Claude Desktop, or your own LLM applications via remote MCP endpoints and API keys.`,
    tag: "For Developers",
    color: "from-emerald-500/20 to-cyan-500/10",
    border: "border-cyan-500/30",
    iconColor: "text-cyan-300",
  },
];

export function LandingFeatures() {
  return (
    <section id="capabilities" className="scroll-mt-16 pt-16 pb-16 border-t border-slate-800/80 bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
            Engineered For Indian Railways
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Six Intelligent Engines Working Together
          </p>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            Everything you need to secure seats, predict arrival times, and optimize multi-leg railway journeys.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className={`p-6 rounded-2xl bg-gradient-to-br ${feat.color} border ${feat.border} backdrop-blur-md flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-inner">
                      <Icon className={`w-5 h-5 ${feat.iconColor}`} />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-900/90 text-slate-300 border border-slate-800">
                      {feat.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
