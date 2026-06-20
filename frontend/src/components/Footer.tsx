export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-black/40 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} IrisVision AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <span className="hover:text-zinc-300 cursor-pointer">SaaS Platform</span>
            <span className="hover:text-zinc-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-300 cursor-pointer">API Docs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
