"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Database, Search, ChevronLeft, ChevronRight, ArrowUpDown, Filter } from "lucide-react";

type RecordItem = {
  id: number;
  sepal_length: number;
  sepal_width: number;
  petal_length: number;
  petal_width: number;
  species: string;
};

const mockRecords: RecordItem[] = [
  { id: 1, sepal_length: 5.1, sepal_width: 3.5, petal_length: 1.4, petal_width: 0.2, species: "setosa" },
  { id: 2, sepal_length: 4.9, sepal_width: 3.0, petal_length: 1.4, petal_width: 0.2, species: "setosa" },
  { id: 3, sepal_length: 4.7, sepal_width: 3.2, petal_length: 1.3, petal_width: 0.2, species: "setosa" },
  { id: 4, sepal_length: 4.6, sepal_width: 3.1, petal_length: 1.5, petal_width: 0.2, species: "setosa" },
  { id: 5, sepal_length: 5.0, sepal_width: 3.6, petal_length: 1.4, petal_width: 0.2, species: "setosa" },
  { id: 51, sepal_length: 7.0, sepal_width: 3.2, petal_length: 4.7, petal_width: 1.4, species: "versicolor" },
  { id: 52, sepal_length: 6.4, sepal_width: 3.2, petal_length: 4.5, petal_width: 1.5, species: "versicolor" },
  { id: 53, sepal_length: 6.9, sepal_width: 3.1, petal_length: 4.9, petal_width: 1.5, species: "versicolor" },
  { id: 54, sepal_length: 5.5, sepal_width: 2.3, petal_length: 4.0, petal_width: 1.3, species: "versicolor" },
  { id: 55, sepal_length: 6.5, sepal_width: 2.8, petal_length: 4.6, petal_width: 1.5, species: "versicolor" },
  { id: 101, sepal_length: 6.3, sepal_width: 3.3, petal_length: 6.0, petal_width: 2.5, species: "virginica" },
  { id: 102, sepal_length: 5.8, sepal_width: 2.7, petal_length: 5.1, petal_width: 1.9, species: "virginica" },
  { id: 103, sepal_length: 7.1, sepal_width: 3.0, petal_length: 5.9, petal_width: 2.1, species: "virginica" },
  { id: 104, sepal_length: 6.3, sepal_width: 2.9, petal_length: 5.6, petal_width: 1.8, species: "virginica" },
  { id: 105, sepal_length: 6.5, sepal_width: 3.0, petal_length: 5.8, petal_width: 2.2, species: "virginica" }
];

export default function DatasetExplorer() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);

  const fetchRecords = () => {
    setLoading(true);
    
    // Construct query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      species_filter: speciesFilter
    });
    if (search) params.append("search", search);
    if (sortBy) {
      params.append("sort_by", sortBy);
      params.append("sort_order", sortOrder);
    }

    fetch(`http://localhost:8000/dataset?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setRecords(data.records);
        setTotalRecords(data.total_records);
      })
      .catch(() => {
        console.warn("API offline, simulating dataset explorer client-side.");
        simulateDatasetClientSide();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const simulateDatasetClientSide = () => {
    // Perform filtering and searching client-side on mock data
    let filtered = [...mockRecords];
    if (speciesFilter !== "all") {
      filtered = filtered.filter(r => r.species.toLowerCase() === speciesFilter.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(r => 
        r.species.toLowerCase().includes(q) ||
        r.sepal_length.toString().includes(q) ||
        r.sepal_width.toString().includes(q) ||
        r.petal_length.toString().includes(q) ||
        r.petal_width.toString().includes(q)
      );
    }
    
    // Sort
    if (sortBy) {
      filtered.sort((a, b) => {
        const valA = a[sortBy as keyof RecordItem];
        const valB = b[sortBy as keyof RecordItem];
        if (typeof valA === "number" && typeof valB === "number") {
          return sortOrder === "asc" ? valA - valB : valB - valA;
        } else {
          return sortOrder === "asc" 
            ? String(valA).localeCompare(String(valB)) 
            : String(valB).localeCompare(String(valA));
        }
      });
    }

    setTotalRecords(filtered.length);
    // Paginate
    const start = (page - 1) * pageSize;
    setRecords(filtered.slice(start, start + pageSize));
  };

  useEffect(() => {
    fetchRecords();
  }, [page, search, speciesFilter, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1); // Reset to page 1 on sort change
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const getSpeciesBadge = (species: string) => {
    const norm = species.toLowerCase();
    if (norm === "setosa") return "bg-cyan-500/10 text-cyan-400 border-cyan-500/25";
    if (norm === "versicolor") return "bg-indigo-500/10 text-indigo-400 border-indigo-500/25";
    return "bg-purple-500/10 text-purple-400 border-purple-500/25";
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="absolute top-10 left-10 w-96 h-96 radial-cyan-glow -z-10" />
        <div className="absolute bottom-10 right-10 w-96 h-96 radial-purple-glow -z-10" />

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Database className="h-7 w-7 text-cyan-400" />
            <span>Dataset Explorer</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Browse, search, sort, and filter through the complete Fisher's Iris database.
          </p>
        </div>

        {/* Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search records by species or measurements..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-zinc-900/60 text-sm text-white placeholder-zinc-500 focus:border-cyan-450 focus:outline-none backdrop-blur-md"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
            <select
              value={speciesFilter}
              onChange={(e) => { setSpeciesFilter(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-zinc-900/60 text-sm text-white focus:border-cyan-450 focus:outline-none backdrop-blur-md appearance-none"
            >
              <option value="all">All Species</option>
              <option value="setosa">Setosa</option>
              <option value="versicolor">Versicolor</option>
              <option value="virginica">Virginica</option>
            </select>
          </div>

          {/* Record Count Badge */}
          <div className="flex items-center justify-center md:justify-end text-xs text-zinc-455 font-medium px-4">
            Total records found: <span className="text-white font-bold ml-1">{totalRecords}</span>
          </div>
        </div>

        {/* Table Container */}
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-zinc-500 font-semibold uppercase tracking-wider bg-black/20">
                  <th className="py-4 px-6 cursor-pointer hover:text-white" onClick={() => handleSort("id")}>
                    <span className="flex items-center gap-1.5">
                      ID <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-white" onClick={() => handleSort("sepal_length")}>
                    <span className="flex items-center gap-1.5">
                      Sepal Length <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-white" onClick={() => handleSort("sepal_width")}>
                    <span className="flex items-center gap-1.5">
                      Sepal Width <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-white" onClick={() => handleSort("petal_length")}>
                    <span className="flex items-center gap-1.5">
                      Petal Length <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-white" onClick={() => handleSort("petal_width")}>
                    <span className="flex items-center gap-1.5">
                      Petal Width <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-white" onClick={() => handleSort("species")}>
                    <span className="flex items-center gap-1.5">
                      Species <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-550">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                        <span>Querying dataset rows...</span>
                      </div>
                    </td>
                  </tr>
                ) : records.length > 0 ? (
                  records.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-zinc-500">{row.id}</td>
                      <td className="py-3.5 px-6 text-white font-medium">{row.sepal_length.toFixed(1)} cm</td>
                      <td className="py-3.5 px-6 text-white font-medium">{row.sepal_width.toFixed(1)} cm</td>
                      <td className="py-3.5 px-6 text-white font-medium">{row.petal_length.toFixed(1)} cm</td>
                      <td className="py-3.5 px-6 text-white font-medium">{row.petal_width.toFixed(1)} cm</td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${getSpeciesBadge(row.species)}`}>
                          {row.species}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-550">
                      No records match the active filters or search terms.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-2 text-xs">
            <span className="text-zinc-500">
              Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span>
            </span>

            <div className="flex gap-2">
              <button 
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>
              <button 
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
