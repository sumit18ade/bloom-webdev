import Image from 'next/image';

interface BloomLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export default function BloomLogo({
  size = 32,
  className = '',
  showText = false,
  textClassName = 'font-headline font-bold text-lg text-slate-900 tracking-tight',
}: BloomLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <Image
          src="/bloom-logo.png"
          alt="Bloom Logo"
          width={size * 2}
          height={size * 2}
          className="w-full h-full object-contain filter drop-shadow-xs"
          priority
        />
      </div>
      {showText && <span className={textClassName}>Bloom</span>}
    </div>
  );
}
