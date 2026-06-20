"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { 
  BarChart2, 
  Layers, 
  Table2, 
  Sparkles
} from "lucide-react";

// Dynamic imports to avoid SSR issues with recharts
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(m => m.Cell), { ssr: false });
const ScatterChart = dynamic(() => import("recharts").then(m => m.ScatterChart), { ssr: false });
const Scatter = dynamic(() => import("recharts").then(m => m.Scatter), { ssr: false });
const ZAxis = dynamic(() => import("recharts").then(m => m.ZAxis), { ssr: false });
const Legend = dynamic(() => import("recharts").then(m => m.Legend), { ssr: false });

const defaultStats = {
  summary: [
    { feature: "Sepal Length", min: 4.3, max: 7.9, mean: 5.84, std: 0.83 },
    { feature: "Sepal Width", min: 2.0, max: 4.4, mean: 3.05, std: 0.43 },
    { feature: "Petal Length", min: 1.0, max: 6.9, mean: 3.76, std: 1.76 },
    { feature: "Petal Width", min: 0.1, max: 2.5, mean: 1.20, std: 0.76 }
  ],
  featureImportance: [
    { name: "Petal Length", value: 44.5 },
    { name: "Petal Width", value: 36.2 },
    { name: "Sepal Length", value: 12.1 },
    { name: "Sepal Width", value: 7.2 }
  ],
  speciesDistribution: [
    { name: "Setosa", value: 50, color: "#06b6d4" },
    { name: "Versicolor", value: 50, color: "#6366f1" },
    { name: "Virginica", value: 50, color: "#a855f7" }
  ],
  scatterData: {
    setosa: [
      { x: 1.4, y: 0.2 }, { x: 1.3, y: 0.2 }, { x: 1.5, y: 0.2 }, { x: 1.7, y: 0.4 },
      { x: 1.4, y: 0.3 }, { x: 1.5, y: 0.2 }, { x: 1.4, y: 0.2 }, { x: 1.5, y: 0.1 },
      { x: 1.9, y: 0.4 }, { x: 1.4, y: 0.2 }
    ],
    versicolor: [
      { x: 4.7, y: 1.4 }, { x: 4.5, y: 1.5 }, { x: 4.9, y: 1.5 }, { x: 4.0, y: 1.3 },
      { x: 4.6, y: 1.5 }, { x: 4.5, y: 1.3 }, { x: 4.7, y: 1.6 }, { x: 3.3, y: 1.0 },
      { x: 4.6, y: 1.3 }, { x: 3.9, y: 1.4 }
    ],
    virginica: [
      { x: 6.0, y: 2.5 }, { x: 5.1, y: 1.9 }, { x: 5.9, y: 2.1 }, { x: 5.6, y: 1.8 },
      { x: 5.8, y: 2.2 }, { x: 6.6, y: 2.1 }, { x: 4.5, y: 1.7 }, { x: 6.3, y: 1.8 },
      { x: 5.8, y: 1.8 }, { x: 6.1, y: 2.5 }
    ]
  }
};

export default function Analytics() {
  const [stats] = useState(defaultStats);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Could fetch real metrics from /metrics endpoint and merge
    fetch("http://localhost:8000/metrics").catch(() => {});
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } })
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="pointer-events-none absolute top-10 right-10 -z-10 h-96 w-96 radial-cyan-glow" />
        <div className="pointer-events-none absolute bottom-10 left-10 -z-10 h-96 w-96 radial-purple-glow" />

        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <BarChart2 className="h-7 w-7 text-cyan-400" />
            <span>AI Dataset Analytics</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Statistical analysis, feature importance, and species clustering models of the Iris dataset.
          </p>
        </div>

        {/* Row 1: Feature Importance + Species Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div
            custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
            className="glass-card rounded-2xl p-6 lg:col-span-2 flex flex-col h-[360px]"
          >
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Feature Importance Ratio (%)</span>
            </h3>
            <div className="relative flex-1 min-h-0 w-full">
              {mounted && (
                <div className="absolute inset-0 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={defaultStats.featureImportance} layout="vertical">
                      <defs>
                        <linearGradient id="impGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                      <XAxis type="number" stroke="#52525b" fontSize={11} tickLine={false} unit="%" />
                      <YAxis dataKey="name" type="category" stroke="#52525b" fontSize={11} tickLine={false} width={90} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                        itemStyle={{ color: "#fff" }}
                        formatter={(value: any) => [`${value}%`, "Importance"]}
                      />
                      <Bar dataKey="value" fill="url(#impGrad)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
            className="glass-card rounded-2xl p-6 flex flex-col h-[360px]"
          >
            <h3 className="text-sm font-semibold text-zinc-400 mb-4">Species Balance</h3>
            <div className="relative flex-1 min-h-0 w-full">
              {mounted && (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.speciesDistribution}
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {stats.speciesDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                        itemStyle={{ color: "#fff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="pointer-events-none absolute flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">Ratio</span>
                <span className="text-lg font-extrabold text-white">1:1:1</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {stats.speciesDistribution.map(item => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-400">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Row 2: Scatter + Stats Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
            className="glass-card rounded-2xl p-6 lg:col-span-2 flex flex-col h-[400px]"
          >
            <h3 className="text-sm font-semibold text-zinc-400 mb-4">
              Clustering: Petal Length vs. Petal Width
            </h3>
            <div className="relative flex-1 min-h-0 w-full">
              {mounted && (
                <div className="absolute inset-0 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                      <XAxis type="number" dataKey="x" name="Petal Length" unit="cm" stroke="#52525b" fontSize={11} />
                      <YAxis type="number" dataKey="y" name="Petal Width" unit="cm" stroke="#52525b" fontSize={11} />
                      <ZAxis type="number" range={[50, 70]} />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Scatter name="Setosa" data={stats.scatterData.setosa} fill="#06b6d4" />
                      <Scatter name="Versicolor" data={stats.scatterData.versicolor} fill="#6366f1" />
                      <Scatter name="Virginica" data={stats.scatterData.virginica} fill="#a855f7" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
            className="glass-card rounded-2xl p-6 flex flex-col"
          >
            <h3 className="text-sm font-semibold text-zinc-400 mb-6 flex items-center gap-1.5">
              <Table2 className="h-4 w-4 text-zinc-500" />
              <span>Feature Statistics</span>
            </h3>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-zinc-500 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Feature</th>
                    <th className="pb-3 text-right">Mean</th>
                    <th className="pb-3 text-right">Min</th>
                    <th className="pb-3 text-right">Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {stats.summary.map((row) => (
                    <tr key={row.feature} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-medium text-white text-[11px]">{row.feature}</td>
                      <td className="py-3 text-right">{row.mean.toFixed(2)}</td>
                      <td className="py-3 text-right">{row.min.toFixed(1)}</td>
                      <td className="py-3 text-right">{row.max.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 flex-shrink-0 text-indigo-400 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-white">Key Insight</h4>
                <p className="mt-1 text-[10px] leading-relaxed text-zinc-400">
                  Petal measurements show higher variance, making them the most discriminative features — confirmed by the clear cluster separation in the scatter chart.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
