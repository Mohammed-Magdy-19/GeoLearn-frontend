import React from "react";

export const TrendsChart: React.FC<{
  data: { month: string; enrollments: number; completions: number }[];
}> = ({ data }) => {
  if (data.length === 0) return null;

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.enrollments, d.completions)),
    1
  );
  const chartHeight = 180;
  const chartWidth = 600;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const xStep = innerWidth / (data.length - 1 || 1);

  const getX = (i: number) => padding.left + i * xStep;
  const getY = (val: number) =>
    padding.top + innerHeight - (val / maxVal) * innerHeight;

  const enrollmentPoints = data
    .map((d, i) => `${getX(i)},${getY(d.enrollments)}`)
    .join(" ");
  const completionPoints = data
    .map((d, i) => `${getX(i)},${getY(d.completions)}`)
    .join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full min-w-[400px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <g key={pct}>
            <line
              x1={padding.left}
              y1={padding.top + innerHeight * (1 - pct)}
              x2={chartWidth - padding.right}
              y2={padding.top + innerHeight * (1 - pct)}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 10}
              y={padding.top + innerHeight * (1 - pct) + 4}
              textAnchor="end"
              className="text-xs fill-muted-foreground"
            >
              {Math.round(maxVal * pct)}
            </text>
          </g>
        ))}

        <polyline
          points={enrollmentPoints}
          fill="none"
          stroke="#f5a623"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={completionPoints}
          fill="none"
          stroke="#0f2044"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.7}
        />

        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={getX(i)}
              cy={getY(d.enrollments)}
              r={4}
              fill="#f5a623"
              stroke="var(--color-background)"
              strokeWidth={2}
            />
            <circle
              cx={getX(i)}
              cy={getY(d.completions)}
              r={4}
              fill="#0f2044"
              stroke="var(--color-background)"
              strokeWidth={2}
            />
            <text
              x={getX(i)}
              y={chartHeight - 10}
              textAnchor="middle"
              className="text-xs fill-muted-foreground"
            >
              {d.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default TrendsChart;
