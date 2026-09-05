import { useMemo } from 'react';
import qrcode from 'qrcode-generator';

/**
 * QR code rendered as crisp inline SVG from the module matrix.
 * Used for reception check-in: the patient shows this code, the clinic scans
 * it and lands on a confirm screen. Nothing is transmitted automatically.
 */
export function QrCode({
  value,
  size = 168,
  label,
  className = '',
}: {
  value: string;
  size?: number;
  label?: string;
  className?: string;
}) {
  const modules = useMemo(() => {
    try {
      const qr = qrcode(0, 'M');
      qr.addData(value, 'Byte');
      qr.make();
      const count = qr.getModuleCount();
      const cells: { x: number; y: number }[] = [];
      for (let row = 0; row < count; row += 1) {
        for (let col = 0; col < count; col += 1) {
          if (qr.isDark(row, col)) cells.push({ x: col, y: row });
        }
      }
      return { count, cells };
    } catch {
      return { count: 0, cells: [] };
    }
  }, [value]);

  if (modules.count === 0) return null;

  const quiet = 2; // quiet zone in modules
  const viewBox = modules.count + quiet * 2;

  return (
    <figure className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        shapeRendering="crispEdges"
        role="img"
        aria-label={label ?? value}
        className="rounded-md bg-white p-2 ring-1 ring-inset ring-shell-300"
      >
        <title>{label ?? value}</title>
        {modules.cells.map((cell) => (
          <rect
            key={`${cell.x}-${cell.y}`}
            x={cell.x + quiet}
            y={cell.y + quiet}
            width={1}
            height={1}
            fill="#10293C"
          />
        ))}
      </svg>
      {label ? <figcaption className="text-[0.6875rem] text-stone-400">{label}</figcaption> : null}
    </figure>
  );
}
