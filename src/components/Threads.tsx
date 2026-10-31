/** Original line art: strands that gather and part, the app's picture of world lines. */
export function Threads({ color, seed = 1, count = 22, className }: { color: string; seed?: number; count?: number; className?: string }) {
  const strands = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const spread = (t - 0.5) * 200;
    const sway = Math.sin(seed * 2.3 + i * 0.7) * 26;
    const pinch = 90 + Math.sin(seed) * 28;
    return `M -10 ${150 + spread} C 150 ${150 + spread * 0.9 + sway}, 230 ${pinch + spread * 0.05}, 320 ${pinch + spread * 0.08} S 500 ${150 + spread * 0.7 - sway}, 610 ${150 + spread * 1.2}`;
  });
  return (
    <svg className={className} viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {strands.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth="1" opacity={0.2 + 0.6 * Math.abs(Math.sin(i * 0.9 + seed))} />
      ))}
    </svg>
  );
}
