import BrandMark from "@/components/ui/BrandMark";

export default function Footer() {
  return (
    <footer className="border-t-2 border-fg">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <BrandMark
          dotSize="h-2 w-2"
          squareSize="h-2 w-2"
          triangleClassName="geo-triangle text-bh-yellow [border-left-width:4px] [border-right-width:4px] [border-bottom-width:7px]"
          className="flex items-center gap-2"
        />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted">
          ScaleLab — {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
