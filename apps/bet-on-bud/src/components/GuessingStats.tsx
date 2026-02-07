import { useState } from "react";
import { Baby, Calendar, Users, DollarSign } from "lucide-react";
import { GuessRecord } from "../lib/guessService";

interface GuessingStatsProps {
  guesses: GuessRecord[];
}

const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Generate dates between min and max (inclusive)
const generateDateRange = (minDate: string, maxDate: string): string[] => {
  const dates: string[] = [];
  const start = new Date(minDate + "T00:00:00");
  const end = new Date(maxDate + "T00:00:00");

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

export const GuessingStats = ({ guesses }: GuessingStatsProps) => {
  const [hoveredSegment, setHoveredSegment] = useState<"boy" | "girl" | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Calculate sex stats
  const boyCount = guesses.filter((g) => g.sex === "boy").length;
  const girlCount = guesses.filter((g) => g.sex === "girl").length;
  const total = guesses.length;
  const boyPercent = total > 0 ? Math.round((boyCount / total) * 100) : 0;
  const girlPercent = total > 0 ? 100 - boyPercent : 0; // Ensure they sum to 100%

  // Calculate total fund
  const totalFund = guesses.reduce((sum, g) => sum + g.contribution_amount, 0);

  // Calculate date distribution - only dates with guesses
  const guessDates = guesses.map((g) => g.guess_date).sort();
  const minGuessDate = guessDates.length > 0 ? guessDates[0] : "2026-05-22";
  const maxGuessDate = guessDates.length > 0 ? guessDates[guessDates.length - 1] : "2026-05-22";

  const displayDates = generateDateRange(minGuessDate, maxGuessDate);
  const dateCounts: Record<string, number> = {};
  displayDates.forEach((d) => (dateCounts[d] = 0));
  guesses.forEach((g) => {
    if (dateCounts[g.guess_date] !== undefined) {
      dateCounts[g.guess_date]++;
    }
  });
  const maxDateCount = Math.max(...Object.values(dateCounts), 1);

  // Generate Y-axis labels (unique integers only)
  const yAxisLabels: number[] = [];
  for (let i = maxDateCount; i >= 0; i--) {
    yAxisLabels.push(i);
  }

  // Calculate donut chart segments
  const radius = 60;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const boyArc = (boyPercent / 100) * circumference;
  const girlArc = (girlPercent / 100) * circumference;

  // Calculate label positions on the donut
  const getLabelPosition = (percent: number, startPercent: number) => {
    const midPercent = startPercent + percent / 2;
    const angle = (midPercent / 100) * 2 * Math.PI - Math.PI / 2; // Start from top
    const labelRadius = radius + strokeWidth / 2 + 15;
    return {
      x: 80 + Math.cos(angle) * labelRadius,
      y: 80 + Math.sin(angle) * labelRadius,
    };
  };

  const boyLabelPos = boyPercent > 0 ? getLabelPosition(boyPercent, 0) : null;
  const girlLabelPos = girlPercent > 0 ? getLabelPosition(girlPercent, boyPercent) : null;

  return (
    <div className="space-y-4">
      <h2
        className="font-display text-2xl md:text-3xl font-bold text-center"
        style={{ color: "var(--bob-text)" }}
      >
        The Stats
      </h2>

      {/* Sex Distribution Card */}
      <div className="bob-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Baby className="w-5 h-5" style={{ color: "var(--bob-coral)" }} />
          <span className="font-medium" style={{ color: "var(--bob-text)" }}>
            What will B.U.D.'s sex be?
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Donut Chart */}
          <div className="relative">
            <svg width="180" height="180" viewBox="0 0 180 180">
              {/* Boy segment (blue) - starts from top */}
              {boyPercent > 0 && (
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="none"
                  stroke={hoveredSegment === "boy" ? "#60a5fa" : "#93c5fd"}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${boyArc} ${circumference}`}
                  strokeDashoffset={circumference / 4}
                  strokeLinecap="butt"
                  style={{ cursor: "pointer", transition: "stroke 0.2s" }}
                  onMouseEnter={() => setHoveredSegment("boy")}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              )}
              {/* Girl segment (coral) - starts after boy */}
              {girlPercent > 0 && (
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="none"
                  stroke={hoveredSegment === "girl" ? "#d4694a" : "#e8805c"}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${girlArc} ${circumference}`}
                  strokeDashoffset={circumference / 4 - boyArc}
                  strokeLinecap="butt"
                  style={{ cursor: "pointer", transition: "stroke 0.2s" }}
                  onMouseEnter={() => setHoveredSegment("girl")}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              )}
            </svg>

            {/* Boy percentage label */}
            {boyPercent > 0 && boyLabelPos && (
              <div
                className="absolute text-sm font-bold pointer-events-none"
                style={{
                  left: boyLabelPos.x + 10,
                  top: boyLabelPos.y + 10,
                  transform: "translate(-50%, -50%)",
                  color: "#3b82f6",
                }}
              >
                {boyPercent}%
              </div>
            )}
            {/* Girl percentage label */}
            {girlPercent > 0 && girlLabelPos && (
              <div
                className="absolute text-sm font-bold pointer-events-none"
                style={{
                  left: girlLabelPos.x + 10,
                  top: girlLabelPos.y + 10,
                  transform: "translate(-50%, -50%)",
                  color: "#e8805c",
                }}
              >
                {girlPercent}%
              </div>
            )}

            {/* Hover tooltip */}
            {hoveredSegment && (
              <div
                className="absolute bg-white shadow-lg rounded-lg px-3 py-2 text-sm pointer-events-none z-10"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  border: "1px solid var(--bob-border)",
                }}
              >
                <div className="font-medium capitalize">{hoveredSegment}</div>
                <div style={{ color: "var(--bob-text-muted)" }}>
                  {hoveredSegment === "boy" ? boyCount : girlCount} vote{(hoveredSegment === "boy" ? boyCount : girlCount) !== 1 ? "s" : ""}
                </div>
                <div className="font-bold" style={{ color: hoveredSegment === "boy" ? "#3b82f6" : "#e8805c" }}>
                  {hoveredSegment === "boy" ? boyPercent : girlPercent}%
                </div>
              </div>
            )}
          </div>

          {/* Vote Cards */}
          <div className="flex flex-1 gap-3 w-full">
            {/* Boy Card */}
            <div
              className="flex-1 p-4 rounded-xl cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: "var(--bob-boy-blue)" }}
              onMouseEnter={() => setHoveredSegment("boy")}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Baby
                    className="w-5 h-5"
                    style={{ color: "var(--bob-boy-blue-text)" }}
                  />
                  <span
                    className="font-medium"
                    style={{ color: "var(--bob-boy-blue-text)" }}
                  >
                    Boy
                  </span>
                </div>
                <span
                  className="text-2xl font-bold"
                  style={{ color: "var(--bob-boy-blue-text)" }}
                >
                  {boyPercent}%
                </span>
              </div>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--bob-boy-blue-text)", opacity: 0.8 }}
              >
                {boyCount} {boyCount === 1 ? "vote" : "votes"}
              </p>
            </div>

            {/* Girl Card */}
            <div
              className="flex-1 p-4 rounded-xl cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: "var(--bob-girl-coral)" }}
              onMouseEnter={() => setHoveredSegment("girl")}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Baby
                    className="w-5 h-5"
                    style={{ color: "var(--bob-girl-coral-text)" }}
                  />
                  <span
                    className="font-medium"
                    style={{ color: "var(--bob-girl-coral-text)" }}
                  >
                    Girl
                  </span>
                </div>
                <span
                  className="text-2xl font-bold"
                  style={{ color: "var(--bob-girl-coral-text)" }}
                >
                  {girlPercent}%
                </span>
              </div>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--bob-girl-coral-text)", opacity: 0.8 }}
              >
                {girlCount} {girlCount === 1 ? "vote" : "votes"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Distribution Card */}
      <div className="bob-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5" style={{ color: "var(--bob-coral)" }} />
          <span className="font-medium" style={{ color: "var(--bob-text)" }}>
            When will B.U.D. arrive?
          </span>
        </div>

        {/* Bar Chart */}
        <div className="overflow-x-auto">
          <div style={{ minWidth: Math.max(displayDates.length * 40, 300) }}>
            {/* Y-axis labels and bars */}
            <div className="flex">
              {/* Y-axis */}
              <div
                className="flex flex-col justify-between text-xs pr-2"
                style={{ color: "var(--bob-text-muted)", height: "120px" }}
              >
                {yAxisLabels.map((label, i) => (
                  <span key={i}>{label}</span>
                ))}
              </div>

              {/* Bars */}
              <div
                className="flex-1 flex items-end gap-2 border-b border-l relative"
                style={{ borderColor: "var(--bob-border)", height: "120px" }}
              >
                {displayDates.map((date) => {
                  const count = dateCounts[date];
                  const height = count > 0 ? (count / maxDateCount) * 100 : 0;
                  const isHovered = hoveredDate === date;
                  return (
                    <div
                      key={date}
                      className="flex-1 flex flex-col items-center justify-end relative"
                      onMouseEnter={() => setHoveredDate(date)}
                      onMouseLeave={() => setHoveredDate(null)}
                    >
                      <div
                        className="w-full max-w-[24px] rounded-t cursor-pointer transition-all"
                        style={{
                          height: `${Math.max(height, count > 0 ? 8 : 0)}%`,
                          backgroundColor: count > 0 ? (isHovered ? "#d4694a" : "#e8805c") : "#e5e7eb",
                          minHeight: count > 0 ? "8px" : "4px",
                        }}
                      />
                      {/* Tooltip */}
                      {isHovered && (
                        <div
                          className="absolute bottom-full mb-2 bg-white shadow-lg rounded-lg px-3 py-2 text-sm z-10 whitespace-nowrap"
                          style={{ border: "1px solid var(--bob-border)" }}
                        >
                          <div className="font-medium">{formatShortDate(date)}</div>
                          <div style={{ color: "var(--bob-text-muted)" }}>
                            {count} {count === 1 ? "guess" : "guesses"}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex mt-2 ml-6">
              {displayDates.map((date, i) => {
                // Show first, last, and every few in between
                const showLabel = i === 0 || i === displayDates.length - 1 ||
                  (displayDates.length > 5 && i % Math.ceil(displayDates.length / 5) === 0);
                return (
                  <div
                    key={date}
                    className="flex-1 text-center"
                    style={{ color: "var(--bob-text-muted)" }}
                  >
                    {showLabel && (
                      <span className="text-xs">{formatShortDate(date)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Betters Card */}
        <div className="bob-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--bob-girl-coral)" }}
            >
              <Users className="w-5 h-5" style={{ color: "var(--bob-girl-coral-text)" }} />
            </div>
            <span style={{ color: "var(--bob-text-muted)" }}>Betters</span>
          </div>
          <p
            className="text-4xl font-bold"
            style={{ color: "var(--bob-text)" }}
          >
            {total}
          </p>
        </div>

        {/* Baby Fund Card */}
        <div className="bob-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--bob-gold)", opacity: 0.3 }}
            >
              <DollarSign className="w-5 h-5" style={{ color: "var(--bob-gold)" }} />
            </div>
            <span style={{ color: "var(--bob-text-muted)" }}>Baby Fund</span>
          </div>
          <p
            className="text-4xl font-bold"
            style={{ color: "var(--bob-text)" }}
          >
            ${totalFund}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--bob-text-muted)" }}>
            for the little one
          </p>
        </div>
      </div>
    </div>
  );
};
