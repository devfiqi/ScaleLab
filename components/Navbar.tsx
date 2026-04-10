import BrandMark from "@/components/ui/BrandMark";

export default function Navbar() {
  return (
    <nav className="border-b-2 border-fg bg-bg">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-3">
          <BrandMark />
          <span className="text-sm font-bold uppercase tracking-[0.15em]">
            ScaleLab
          </span>
        </a>

        <a
          href="#prompt"
          className="btn-press border-2 border-fg bg-fg px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-bg shadow-hard-sm"
        >
          New Design
        </a>
      </div>
    </nav>
  );
}
