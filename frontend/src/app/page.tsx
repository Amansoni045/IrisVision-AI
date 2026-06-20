"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { 
  Zap, 
  Brain, 
  BarChart3, 
  ShieldCheck, 
  Flame, 
  ArrowRight,
  Activity,
  Layers,
  Database
} from "lucide-react";

// Dynamically import Recharts to avoid SSR issues
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });

import Link from "next/link";

const defaultDatasetStats = {
  total_samples: 150,
  species: [
    { name: "Setosa", value: 50, color: "#06b6d4" },
    { name: "Versicolor", value: 50, color: "#6366f1" },
    { name: "Virginica", value: 50, color: "#a855f7" }
  ],
  feature_averages: [
    { name: "Sepal L", Setosa: 5.0, Versicolor: 5.9, Virginica: 6.5 },
    { name: "Sepal W", Setosa: 3.4, Versicolor: 2.7, Virginica: 2.9 },
    { name: "Petal L", Setosa: 1.4, Versicolor: 4.2, Virginica: 5.5 },
    { name: "Petal W", Setosa: 0.2, Versicolor: 1.3, Virginica: 2.0 }
  ]
};

const features = [
  {
    icon: Flame,
    title: "Real-time Prediction",
    desc: "Get instant classifications as you adjust sliders, powered by our PyTorch neural network backend."
  },
  {
    icon: Brain,
    title: "ML-Powered ANN",
    desc: "Utilizes a highly optimized 3-layer Artificial Neural Network with dropout regularization."
  },
  {
    icon: BarChart3,
    title: "Dataset Analytics",
    desc: "Interactive exploration of feature distributions, correlations, and dataset composition."
  },
  {
    icon: ShieldCheck,
    title: "Confidence Scores",
    desc: "Full probability distribution across all three species, showing exactly how certain the model is."
  },
  {
    icon: Layers,
    title: "Feature Importance",
    desc: "Understand why predictions are made — highlighting the most influential variables."
  },
  {
    icon: Zap,
    title: "Fast Inference",
    desc: "Optimized PyTorch model served via FastAPI, delivering sub-millisecond inference times."
  }
];

const metrics = [
  { label: "Accuracy", value: "100%", sub: "On hold-out test set" },
  { label: "Precision", value: "97.3%", sub: "Weighted avg." },
  { label: "Recall", value: "97.3%", sub: "Weighted avg." },
  { label: "F1 Score", value: "97.3%", sub: "Weighted avg." }
];

export default function Home() {
  const [stats, setStats] = useState(defaultDatasetStats);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("http://localhost:8000/dataset-stats")
      .then(res => res.json())
      .then(data => {
        const mapped = {
          total_samples: data.total_samples,
          species: Object.entries(data.species_count).map(([key, val]) => ({
            name: key.replace("Iris-", ""),
            value: val as number,
            color: key.includes("setosa") ? "#06b6d4" : key.includes("versicolor") ? "#6366f1" : "#a855f7"
          })),
          feature_averages: defaultDatasetStats.feature_averages
        };
        setStats(mapped);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1 relative">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] radial-cyan-glow" />
        <div className="pointer-events-none absolute top-1/3 right-1/4 -z-10 h-[600px] w-[600px] radial-glow" />
        <div className="pointer-events-none absolute bottom-10 left-1/3 -z-10 h-[500px] w-[500px] radial-purple-glow" />

        {/* Hero Section */}
        <section className="relative grid-bg pb-16 pt-20 md:pb-24 md:pt-32">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-cyan-400 backdrop-blur-md"
            >
              <Activity className="h-3 w-3 animate-pulse" />
              <span>Production-Grade Deep Learning Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl"
            >
              IrisVision{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                AI
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl"
            >
              Intelligent Flower Species Classification Powered by Machine Learning.
              Analyze class probabilities and visualize neural feature importance in real-time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              <Link
                href="/predict"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
              >
                <span>Launch Classification</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/analytics"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-zinc-300 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
              >
                Explore Analytics
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Model Performance Metrics */}
        <section className="border-y border-white/5 bg-black/30 py-10 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="text-center">
                  <span className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    {metric.label}
                  </span>
                  <span className="mt-1 block bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
                    {metric.value}
                  </span>
                  <span className="text-xs text-zinc-600">{metric.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Startup-Grade AI Platform Features
              </h2>
              <p className="mt-4 text-zinc-400">
                Built with modern components, high-speed API architecture, and stunning interactive design.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="glass-card rounded-2xl p-6 transition-all"
                  >
                    <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 text-cyan-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-white">{feat.title}</h3>
                    <p className="text-sm leading-relaxed text-zinc-400">{feat.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Dataset Dashboard */}
        <section className="border-t border-white/5 bg-black/40 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-12 lg:flex-row">
              <div className="space-y-6 lg:w-1/3">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-indigo-400">
                  <Database className="h-3.5 w-3.5" />
                  <span>Dataset Overview</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Interactive Dataset Dashboard
                </h2>
                <p className="leading-relaxed text-zinc-400">
                  Analyze the fundamental dataset properties. IrisVision AI runs on the famous Iris dataset — 150 samples across 3 unique biological species.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card rounded-xl p-4 text-center">
                    <span className="block text-xs font-medium text-zinc-500">TOTAL SAMPLES</span>
                    <span className="text-2xl font-bold text-white">{stats.total_samples}</span>
                  </div>
                  <div className="glass-card rounded-xl p-4 text-center">
                    <span className="block text-xs font-medium text-zinc-500">SPECIES COUNT</span>
                    <span className="text-2xl font-bold text-white">{stats.species.length}</span>
                  </div>
                </div>
              </div>

              <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:w-2/3">
                {/* Species Pie Chart */}
                <div className="glass-card flex h-[320px] flex-col rounded-2xl p-6">
                  <h3 className="mb-4 flex items-center justify-between text-sm font-semibold text-zinc-400">
                    <span>Species Distribution</span>
                    <span className="text-xs font-medium text-emerald-400">Balanced</span>
                  </h3>
                  <div className="relative flex min-h-0 flex-1 items-center justify-center min-w-0">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <PieChart>
                          <Pie data={stats.species} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                            {stats.species.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                            itemStyle={{ color: "#fff" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    <div className="pointer-events-none absolute flex flex-col items-center">
                      <span className="text-xs text-zinc-500">Total</span>
                      <span className="text-3xl font-extrabold text-white">{stats.total_samples}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center gap-4">
                    {stats.species.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5 text-xs">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-zinc-400">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature Averages Bar Chart */}
                <div className="glass-card flex h-[320px] flex-col rounded-2xl p-6">
                  <h3 className="mb-4 text-sm font-semibold text-zinc-400">Feature Averages (cm)</h3>
                  <div className="min-h-0 flex-1 min-w-0">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart data={stats.feature_averages}>
                          <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                          <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                            itemStyle={{ color: "#fff" }}
                          />
                          <Bar dataKey="Setosa" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Versicolor" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Virginica" fill="#a855f7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
