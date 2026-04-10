type BrandMarkProps = {
  dotSize?: string;
  squareSize?: string;
  triangleClassName?: string;
  className?: string;
};

export default function BrandMark({
  dotSize = "h-3 w-3",
  squareSize = "h-3 w-3",
  triangleClassName = "geo-triangle text-bh-yellow",
  className = "flex items-center gap-1",
}: BrandMarkProps) {
  return (
    <div className={className} aria-hidden="true">
      <div className={`${dotSize} rounded-full bg-bh-red`} />
      <div className={`${squareSize} bg-bh-blue`} />
      <div className={triangleClassName} />
    </div>
  );
}
