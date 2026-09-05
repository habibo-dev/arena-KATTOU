import { useId } from 'react';
import { useI18n } from '@/i18n';

/**
 * Hand-rolled SVG charts. No chart library ships to the patient bundle, and
 * every chart degrades to a readable table for screen readers.
 */

export interface BarDatum {
  label: string;
  value: number;
  /** Optional secondary label rendered under the bar. */
  hint?: string;
}

export function BarChart({
  data,
  unit = '',
  height = 148,
  emptyLabel,
}: {
  data: BarDatum[];
  unit?: string;
  height?: number;
  emptyLabel: string;
}) {
  const gradientId = useId();

  if (data.length === 0) {
    return (
      <div className="grid h-32 place-items-center rounded-lg border border-dashed border-shell-300 text-[0.8125rem] text-stone-400">
        {emptyLabel}
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const gap = 12;
  const barWidth = Math.max(14, Math.min(46, (560 - gap * (data.length - 1)) / data.length));
  const width = data.length * barWidth + (data.length - 1) * gap;
  const plotHeight = height - 34;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={data.map((d) => `${d.label}: ${d.value}${unit}`).join(', ')}
        className="w-full"
        style={{ maxHeight: height }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3E7C69" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#3E7C69" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* Baseline */}
        <line x1="0" y1={plotHeight} x2={width} y2={plotHeight} stroke="#E6E2DA" strokeWidth="1" />

        {data.map((d, i) => {
          const barHeight = Math.max(2, (d.value / max) * (plotHeight - 8));
          const x = i * (barWidth + gap);
          const y = plotHeight - barHeight;
          return (
            <g key={`${d.label}-${i}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="3"
                fill={`url(#${gradientId})`}
              />
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                className="num"
                fontSize="11"
                fontWeight="600"
                fill="#10293C"
              >
                {d.value}
                {unit}
              </text>
              <text
                x={x + barWidth / 2}
                y={plotHeight + 15}
                textAnchor="middle"
                fontSize="10"
                fill="#7E7A73"
              >
                {d.label.length > 8 ? `${d.label.slice(0, 7)}…` : d.label}
              </text>
            </g>
          );
        })}
      </svg>

      <figcaption className="sr-only">
        <table>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <td>{d.label}</td>
                <td>
                  {d.value}
                  {unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}

/** Horizontal comparison rows — best for per-service averages. */
export function RankedBars({
  data,
  unit = '',
  emptyLabel,
}: {
  data: { label: string; value: number; count?: number }[];
  unit?: string;
  emptyLabel: string;
}) {
  if (data.length === 0) {
    return (
      <div className="grid h-24 place-items-center rounded-lg border border-dashed border-shell-300 text-[0.8125rem] text-stone-400">
        {emptyLabel}
      </div>
    );
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[0.8125rem] text-navy-800">{d.label}</span>
            <span className="num shrink-0 text-[0.8125rem] font-semibold text-navy-900">
              {d.value}
              {unit}
              {typeof d.count === 'number' ? (
                <span className="ms-1.5 font-normal text-stone-400">({d.count})</span>
              ) : null}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-shell-200">
            <div
              className="h-full rounded-full bg-sage-500 transition-[width] duration-500 ease-smooth"
              style={{ width: `${Math.max(3, (d.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** 24-hour activity strip — reads better than a bar chart for peak hours. */
export function HourStrip({
  data,
  emptyLabel,
}: {
  data: { hour: number; count: number }[];
  emptyLabel: string;
}) {
  const { t } = useI18n();
  const counts = new Map(data.map((d) => [d.hour, d.count]));
  const max = Math.max(...[...counts.values()], 1);

  if (data.length === 0) {
    return (
      <div className="grid h-24 place-items-center rounded-lg border border-dashed border-shell-300 text-[0.8125rem] text-stone-400">
        {emptyLabel}
      </div>
    );
  }

  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 → 20:00

  return (
    <div>
      <div
        className="flex items-end gap-1"
        role="img"
        aria-label={`${t('analytics.peakHours')}: ${data
          .map((d) => `${String(d.hour).padStart(2, '0')}:00 ${d.count}`)
          .join(', ')}`}
      >
        {hours.map((hour) => {
          const count = counts.get(hour) ?? 0;
          const ratio = count / max;
          return (
            <div key={hour} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className="w-full rounded-t transition-[height] duration-500 ease-smooth"
                style={{
                  height: `${8 + ratio * 56}px`,
                  backgroundColor:
                    count === 0
                      ? '#E6E2DA'
                      : ratio > 0.66
                        ? '#2F6354'
                        : ratio > 0.33
                          ? '#549785'
                          : '#AED3C7',
                }}
                title={`${String(hour).padStart(2, '0')}:00 — ${count}`}
              />
              <span className="num text-[0.5625rem] text-stone-400">{hour}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-2.5 text-[0.6875rem] text-stone-400">
        {t('analytics.peakHours')} · {String(hours[0]).padStart(2, '0')}:00 –{' '}
        {String(hours[hours.length - 1]).padStart(2, '0')}:00
      </p>
    </div>
  );
}

/** Compact outcome distribution used on the reception summary. */
export function OutcomeBar({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;
  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-shell-200">
        {segments.map((s) =>
          s.value > 0 ? (
            <span
              key={s.label}
              className="h-full"
              style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
              title={`${s.label}: ${s.value}`}
            />
          ) : null,
        )}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5 text-[0.75rem] text-stone-600">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
              aria-hidden="true"
            />
            {s.label}
            <span className="num font-semibold text-navy-900">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
