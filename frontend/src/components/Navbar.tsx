"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flower2, BarChart2, CheckCircle2, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Classify", href: "/predict", icon: Flower2 },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                <Flower2 className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
              </div>
              <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
                IrisVision <span className="text-cyan-400 font-medium">AI</span>
              </span>
            </Link>
          </div>

          <nav className="flex space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-nav"
                      className="absolute inset-0 rounded-full bg-white/5 border border-white/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
