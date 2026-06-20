"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Trophy, ShieldCheck, Zap, Activity, Clock } from "lucide-react";

// Recharts dynamically imported to prevent Next.js SSR warnings
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), { ssr: false });

const mockLeaderboard = {
  "Neural Network": { "accuracy": 1.0, "precision": 1.0, "recall": 1.0, "f1_score": 1.0, "training_time": 0.54 },
  "Random Forest": { "accuracy": 1.0, "precision": 1.0, "recall": 1.0, "f1_score": 1.0, "training_time": 0.045 },
  "SVM": { "accuracy": 1.0, "precision": 1.0, "recall": 1.0, "f1_score": 1.0, "training_time": 0.0025 },
  "Logistic Regression": { "accuracy": 1.0, "precision": 1.0, "recall": 1.0, "f1_score": 1.0, "training_time": 0.008 }
};

export default function Leaderboard() {
  const [data, setData] = useState<any>(mockLeaderboard);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("http://localhost:8000/model-leaderboard")
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(json => {
        setData(json);
      })
      .catch(() => {
        console.warn("API offline, falling back to cached leaderboard data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Format data for Recharts comparison
  const chartData = Object.entries(data).map(([key, val]: [string, any]) => ({
    name: key,
    Accuracy: parseFloat((val.accuracy * 100).toFixed(1)),
    F1_Score: parseFloat((val.f1_score * 100).toFixed(1)),
    Speed_ms: parseFloat((val.training_time * 1000).toFixed(1))
  }));

  const sortedLeaderboard = Object.entries(data)
    .map(([key, val]: [string, any]) => ({ name: key, ...val }))
    .sort((a, b) => b.accuracy - a.accuracy || a.training_time - b.training_time);

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="absolute top-10 left-10 w-96 h-96 radial-cyan-glow -z-10" />
        <div className="absolute bottom-10 right-10 w-96 h-96 radial-purple-glow -z-10" />

        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <Trophy className="h-7 w-7 text-cyan-400" />
              <span>Model Leaderboard</span>
            </h1>
            <p className="text-sm text-zinc-400 mt-2">
              Comparative analysis of performance across multiple machine learning estimators and deep neural networks.
            </p>
          </div>
          {loading && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs text-zinc-400">
              <span className="w-2.5 h-2.5 border border-zinc-450 border-t-zinc-200 rounded-full animate-spin" />
              Syncing latest runs...
            </div>
          )}
        </div>

        {/* comparative summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-cyan-450/10 border border-cyan-450/20 text-cyan-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Highest Accuracy</span>
              <span className="mt-1 block text-2xl font-bold text-white">
                {sortedLeaderboard[0]?.name || "N/A"}
              </span>
              <span className="text-xs text-emerald-450 mt-1 block">
                {(sortedLeaderboard[0]?.accuracy * 100).toFixed(1)}% test accuracy
              </span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Fastest Classifier</span>
              <span className="mt-1 block text-2xl font-bold text-white">
                {Object.entries(data)
                  .map(([k, v]: [string, any]) => ({ name: k, time: v.training_time }))
                  .sort((a, b) => a.time - b.time)[0]?.name || "N/A"}
              </span>
              <span className="text-xs text-indigo-400 mt-1 block">
                {(((Object.entries(data).sort((a: any, b: any) => a[1].training_time - b[1].training_time)[0]?.[1]) as any)?.training_time * 1000).toFixed(2)} ms training
              </span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Dataset Uniformity</span>
              <span className="mt-1 block text-2xl font-bold text-white">Balanced</span>
              <span className="text-xs text-zinc-500 mt-1 block">50 samples per class (150 total)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Detailed Leaderboard Table */}
          <div className="glass-card rounded-2xl p-6 lg:col-span-2 overflow-hidden flex flex-col">
            <h3 className="text-sm font-semibold text-zinc-400 mb-6">Model Ranking</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-zinc-500 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Rank & Model</th>
                    <th className="pb-3 text-right">Accuracy</th>
                    <th className="pb-3 text-right">Precision</th>
                    <th className="pb-3 text-right">Recall</th>
                    <th className="pb-3 text-right">F1 Score</th>
                    <th className="pb-3 text-right">Training Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {sortedLeaderboard.map((model, idx) => (
                    <tr key={model.name} className="hover:bg-white/5 transition-colors group">
                      <td className="py-4 font-semibold text-white flex items-center gap-2.5">
                        <span className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] ${
                          idx === 0 ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/35" : "bg-white/5 text-zinc-550 border border-white/5"
                        }`}>
                          {idx + 1}
                        </span>
                        <span>{model.name}</span>
                      </td>
                      <td className="py-4 text-right font-bold text-white">{(model.accuracy * 100).toFixed(1)}%</td>
                      <td className="py-4 text-right">{(model.precision * 100).toFixed(1)}%</td>
                      <td className="py-4 text-right">{(model.recall * 100).toFixed(1)}%</td>
                      <td className="py-4 text-right">{(model.f1_score * 100).toFixed(1)}%</td>
                      <td className="py-4 text-right text-zinc-500 font-mono">
                        <span className="flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" />
                          {(model.training_time * 1000).toFixed(2)} ms
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leaderboard Chart comparison */}
          <div className="glass-card rounded-2xl p-6 flex flex-col h-[380px]">
            <h3 className="text-sm font-semibold text-zinc-400 mb-4">Accuracy vs F1-Score (%)</h3>
            <div className="relative flex-1 min-h-0 w-full">
              {mounted && (
                <div className="absolute inset-0 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ left: -10, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#52525b" fontSize={10} tickLine={false} domain={[80, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" fontSize={11} />
                      <Bar dataKey="Accuracy" fill="#06b6d4" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="F1_Score" fill="#6366f1" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
