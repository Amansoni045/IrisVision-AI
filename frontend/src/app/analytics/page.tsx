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
  Sparkles,
  GitBranch,
  TrendingUp,
  Percent,
  Sliders
} from "lucide-react";

// Dynamic Recharts to prevent next/hydration warnings
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });
const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });
const ScatterChart = dynamic(() => import("recharts").then((mod) => mod.ScatterChart), { ssr: false });
const Scatter = dynamic(() => import("recharts").then((mod) => mod.Scatter), { ssr: false });
const ZAxis = dynamic(() => import("recharts").then((mod) => mod.ZAxis), { ssr: false });
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), { ssr: false });

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
      { x: 1.4, y: 0.3 }, { x: 1.5, y: 0.2 }, { x: 1.4, y: 0.2 }, { x: 1.5, y: 0.1 }
    ],
    versicolor: [
      { x: 4.7, y: 1.4 }, { x: 4.5, y: 1.5 }, { x: 4.9, y: 1.5 }, { x: 4.0, y: 1.3 },
      { x: 4.6, y: 1.5 }, { x: 4.5, y: 1.3 }, { x: 4.7, y: 1.6 }, { x: 3.3, y: 1.0 }
    ],
    virginica: [
      { x: 6.0, y: 2.5 }, { x: 5.1, y: 1.9 }, { x: 5.9, y: 2.1 }, { x: 5.6, y: 1.8 },
      { x: 5.8, y: 2.2 }, { x: 6.6, y: 2.1 }, { x: 4.5, y: 1.7 }, { x: 6.3, y: 1.8 }
    ]
  }
};

const mockAdvancedAnalytics = {
  correlation_matrix: [
    { x: "SepalLength", y: "SepalLength", val: 1.0 },
    { x: "SepalLength", y: "SepalWidth", val: -0.11 },
    { x: "SepalLength", y: "PetalLength", val: 0.87 },
    { x: "SepalLength", y: "PetalWidth", val: 0.82 },
    { x: "SepalWidth", y: "SepalLength", val: -0.11 },
    { x: "SepalWidth", y: "SepalWidth", val: 1.0 },
    { x: "SepalWidth", y: "PetalLength", val: -0.42 },
    { x: "SepalWidth", y: "PetalWidth", val: -0.36 },
    { x: "PetalLength", y: "SepalLength", val: 0.87 },
    { x: "PetalLength", y: "SepalWidth", val: -0.42 },
    { x: "PetalLength", y: "PetalLength", val: 1.0 },
    { x: "PetalLength", y: "PetalWidth", val: 0.96 },
    { x: "PetalWidth", y: "SepalLength", val: 0.82 },
    { x: "PetalWidth", y: "SepalWidth", val: -0.36 },
    { x: "PetalWidth", y: "PetalLength", val: 0.96 },
    { x: "PetalWidth", y: "PetalWidth", val: 1.0 }
  ],
  confusion_matrices: {
    "Neural Network": [[10, 0, 0], [0, 9, 0], [0, 0, 11]],
    "Random Forest": [[10, 0, 0], [0, 9, 0], [0, 0, 11]],
    "SVM": [[10, 0, 0], [0, 9, 0], [0, 0, 11]],
    "Logistic Regression": [[10, 0, 0], [0, 9, 0], [0, 0, 11]]
  },
  roc_curves: {
    "Neural Network": {
      "setosa": [{ fpr: 0, tpr: 0 }, { fpr: 0, tpr: 1 }, { fpr: 1, tpr: 1 }],
      "versicolor": [{ fpr: 0, tpr: 0 }, { fpr: 0.05, tpr: 0.9 }, { fpr: 0.1, tpr: 1 }, { fpr: 1, tpr: 1 }],
      "virginica": [{ fpr: 0, tpr: 0 }, { fpr: 0.05, tpr: 0.95 }, { fpr: 1, tpr: 1 }]
    }
  },
  pr_curves: {
    "Neural Network": {
      "setosa": [{ recall: 0, precision: 1 }, { recall: 1, precision: 1 }],
      "versicolor": [{ recall: 0, precision: 1 }, { recall: 0.9, precision: 0.95 }, { recall: 1, precision: 0.9 }],
      "virginica": [{ recall: 0, precision: 1 }, { recall: 1, precision: 1 }]
    }
  }
};

export default function Analytics() {
  const [stats] = useState(defaultStats);
  const [advData, setAdvData] = useState<any>(mockAdvancedAnalytics);
  const [mounted, setMounted] = useState(false);
  
  // Controls for ROC/PR Curve display
  const [selectedModel, setSelectedModel] = useState<string>("Neural Network");
  const [selectedSpecies, setSelectedSpecies] = useState<string>("versicolor");

  useEffect(() => {
    setMounted(true);
    fetch("http://localhost:8000/advanced-analytics")
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setAdvData(data);
      })
      .catch(() => {
        console.warn("API offline, utilizing high-fidelity simulated analytics mock data.");
      });
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } })
  };

  const getHeatmapColor = (val: number) => {
    // correlation values range from -1.0 to 1.0
    if (val >= 0) {
      const alpha = Math.min(val, 0.9);
      return `rgba(6, 182, 212, ${alpha + 0.1})`; // Cyan positive correlation
    } else {
      const alpha = Math.min(Math.abs(val), 0.9);
      return `rgba(239, 68, 68, ${alpha + 0.1})`; // Red negative correlation
    }
  };

  const getConfusionCellColor = (count: number, maxCount: number = 11) => {
    if (count === 0) return "rgba(255,255,255,0.02)";
    const ratio = count / maxCount;
    return `rgba(99, 102, 241, ${ratio * 0.8 + 0.2})`; // Indigo shade matching count
  };

  // Get active ROC/PR curve data safely
  const activeRoc = advData.roc_curves[selectedModel]?.[selectedSpecies] || 
    mockAdvancedAnalytics.roc_curves["Neural Network"][selectedSpecies as keyof typeof mockAdvancedAnalytics.roc_curves["Neural Network"]];
  const activePr = advData.pr_curves[selectedModel]?.[selectedSpecies] || 
    mockAdvancedAnalytics.pr_curves["Neural Network"][selectedSpecies as keyof typeof mockAdvancedAnalytics.pr_curves["Neural Network"]];

  const cmMatrix = advData.confusion_matrices[selectedModel] || [[10, 0, 0], [0, 9, 0], [0, 0, 11]];
  const speciesLabels = ["Setosa", "Versicolor", "Virginica"];

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="pointer-events-none absolute top-10 right-10 -z-10 h-96 w-96 radial-cyan-glow" />
        <div className="pointer-events-none absolute bottom-10 left-10 -z-10 h-96 w-96 radial-purple-glow" />

        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <BarChart2 className="h-7 w-7 text-cyan-400" />
              <span>Advanced Machine Learning Analytics</span>
            </h1>
            <p className="text-sm text-zinc-400 mt-2">
              Deep-dive metrics including confusion matrix details, ROC threshold curves, and Pearson correlation heatmaps.
            </p>
          </div>
          
          {/* Controls toggle bar */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 p-1">
              {["Neural Network", "Random Forest", "SVM", "Logistic Regression"].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedModel(m)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    selectedModel === m ? "bg-cyan-500 text-white shadow" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {m.replace("Logistic ", "")}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 p-1">
              {["setosa", "versicolor", "virginica"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSpecies(s)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-all ${
                    selectedSpecies === s ? "bg-indigo-500 text-white shadow" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 1: ROC + PR Curves side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
            className="glass-card rounded-2xl p-6 flex flex-col h-[380px]"
          >
            <h3 className="text-sm font-semibold text-zinc-400 mb-2 flex items-center justify-between">
              <span>ROC Curve (TPR vs. FPR)</span>
              <span className="text-[10px] text-zinc-550 font-mono">{selectedModel} - {selectedSpecies}</span>
            </h3>
            <p className="text-[10.5px] text-zinc-500 mb-4">
              Receiver Operating Characteristic (ROC) plots true positive rate against false positive rate. Higher area under curve (AUC) represents superior class isolation.
            </p>
            <div className="relative flex-1 min-h-0 w-full">
              {mounted && (
                <div className="absolute inset-0 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeRoc} margin={{ left: -20, bottom: 0, right: 10 }}>
                      <XAxis dataKey="fpr" type="number" stroke="#52525b" fontSize={10} domain={[0, 1]} tickLine={false} />
                      <YAxis dataKey="tpr" type="number" stroke="#52525b" fontSize={10} domain={[0, 1]} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Line type="monotone" dataKey="tpr" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} />
                      {/* Random guess baseline */}
                      <Line type="monotone" dataKey="fpr" stroke="#3f3f46" strokeDasharray="3 3" dot={false} activeDot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
            className="glass-card rounded-2xl p-6 flex flex-col h-[380px]"
          >
            <h3 className="text-sm font-semibold text-zinc-400 mb-2 flex items-center justify-between">
              <span>Precision-Recall Curve</span>
              <span className="text-[10px] text-zinc-550 font-mono">{selectedModel} - {selectedSpecies}</span>
            </h3>
            <p className="text-[10.5px] text-zinc-500 mb-4">
              Precision-Recall plots positive predictive value against sensitivity. Critical for evaluating classification accuracy on edge samples.
            </p>
            <div className="relative flex-1 min-h-0 w-full">
              {mounted && (
                <div className="absolute inset-0 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activePr} margin={{ left: -20, bottom: 0, right: 10 }}>
                      <XAxis dataKey="recall" type="number" stroke="#52525b" fontSize={10} domain={[0, 1]} tickLine={false} />
                      <YAxis dataKey="precision" type="number" stroke="#52525b" fontSize={10} domain={[0, 1]} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Line type="monotone" dataKey="precision" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Row 2: Heatmap + Confusion Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Feature Correlation Heatmap */}
          <motion.div
            custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
            className="glass-card rounded-2xl p-6 flex flex-col h-[380px]"
          >
            <h3 className="text-sm font-semibold text-zinc-400 mb-2">Pearson Feature Correlation Heatmap</h3>
            <p className="text-[10.5px] text-zinc-500 mb-6">
              Shows linear relationship weights between variables. Dark Cyan represents strong positive correlation (e.g. Petal Length/Width), while red indicates negative correlation.
            </p>
            <div className="flex-1 grid grid-cols-4 grid-rows-4 gap-2 text-center text-[10px] text-zinc-400">
              {advData.correlation_matrix.map((cell: any, idx: number) => (
                <div 
                  key={idx}
                  style={{ backgroundColor: getHeatmapColor(cell.val) }}
                  className="rounded-lg flex flex-col items-center justify-center p-1 border border-white/5"
                  title={`${cell.x} vs ${cell.y}: ${cell.val}`}
                >
                  <span className="text-[8px] text-zinc-500 font-medium truncate w-full">
                    {cell.x.replace("Cm", "").replace("Length", " L").replace("Width", " W")}
                  </span>
                  <span className="text-white font-bold mt-0.5">{cell.val.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Interactive Confusion Matrix */}
          <motion.div
            custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
            className="glass-card rounded-2xl p-6 flex flex-col h-[380px]"
          >
            <h3 className="text-sm font-semibold text-zinc-400 mb-2 flex items-center justify-between">
              <span>Confusion Matrix (Hold-out Test Set)</span>
              <span className="text-[10px] text-zinc-550 font-mono">{selectedModel}</span>
            </h3>
            <p className="text-[10.5px] text-zinc-500 mb-6">
              Compares the model's predicted label (columns) against the actual ground-truth classes (rows). Clear diagonal matches represent correct predictions.
            </p>

            <div className="flex-1 flex flex-col justify-center items-center">
              {/* Confusion grid */}
              <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
                {/* Empty corner */}
                <div className="flex items-center justify-center text-[9px] text-zinc-650 font-bold uppercase">Act \ Pred</div>
                {/* Headers */}
                {speciesLabels.map((lbl) => (
                  <div key={lbl} className="flex items-center justify-center text-[9.5px] font-bold text-zinc-450 uppercase">{lbl}</div>
                ))}

                {/* Grid Rows */}
                {speciesLabels.map((rowLabel, rIdx) => (
                  <>
                    <div key={rowLabel} className="flex items-center justify-start text-[9.5px] font-bold text-zinc-450 uppercase pr-2">{rowLabel}</div>
                    {speciesLabels.map((colLabel, cIdx) => {
                      const count = cmMatrix[rIdx]?.[cIdx] || 0;
                      const isCorrect = rIdx === cIdx;
                      return (
                        <div 
                          key={`${rIdx}-${cIdx}`}
                          style={{ backgroundColor: getConfusionCellColor(count) }}
                          className={`aspect-video rounded-xl border border-white/5 flex flex-col items-center justify-center p-2 relative ${
                            isCorrect && count > 0 ? "shadow-indigo-500/10" : ""
                          }`}
                        >
                          <span className="text-lg font-extrabold text-white">{count}</span>
                          <span className="text-[8px] text-zinc-550 uppercase">
                            {isCorrect ? "True" : "False"}
                          </span>
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Row 3: Legacy Analytics details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
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
            custom={5} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
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
                  Petal dimensions are the most powerful predictors — confirmed by their strong correlation value (0.96) and high feature importance weight ratio (44.5%).
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
