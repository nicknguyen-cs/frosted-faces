import Link from "next/link";
import { getDogs } from "@/lib/contentstack";

// ─── Time helpers ───────────────────────────────────────────────────────────

function daysInShelter(intakeDate: string | undefined, dateAdded: string): number {
  const ref = intakeDate || dateAdded;
  return Math.floor((Date.now() - new Date(ref).getTime()) / 86_400_000);
}

type Season = "spring" | "summer" | "fall" | "winter";

function getSeason(date: Date): Season {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

function seasonsCrossed(intake: Date, now: Date): number {
  const boundaries = [2, 5, 8, 11]; // Mar, Jun, Sep, Dec
  let count = 0;
  for (let y = intake.getFullYear(); y <= now.getFullYear(); y++) {
    for (const m of boundaries) {
      const boundary = new Date(y, m, 1);
      if (boundary > intake && boundary <= now) count++;
    }
  }
  return count;
}

function formatSeason(days: number, intakeDate: Date): string {
  if (days <= 1) return "Just arrived";
  if (days <= 14) return "New this week";
  if (days <= 60) return "Waiting for a home";

  const season = getSeason(intakeDate);
  const crossed = seasonsCrossed(intakeDate, new Date());

  if (crossed <= 2) return `Here since ${season}`;
  if (crossed <= 5) return `Through ${crossed} seasons`;
  return `Still here after ${crossed} seasons`;
}

// ─── Urgency tiers ──────────────────────────────────────────────────────────

type Urgency = "fresh" | "waiting" | "long" | "urgent" | "critical";

function getUrgency(days: number): Urgency {
  if (days <= 14) return "fresh";
  if (days <= 60) return "waiting";
  if (days <= 180) return "long";
  if (days <= 730) return "urgent";
  return "critical";
}

const ringCount: Record<Urgency, number> = {
  fresh: 0,
  waiting: 1,
  long: 2,
  urgent: 3,
  critical: 4,
};

const ringStyles: Record<Urgency, { border: string; text: string; pulse: boolean }> = {
  fresh:    { border: "border-sage-light/80", text: "text-sage-light", pulse: false },
  waiting:  { border: "border-sage/70",       text: "text-sage",       pulse: false },
  long:     { border: "border-amber/70",      text: "text-amber",      pulse: false },
  urgent:   { border: "border-terracotta/80", text: "text-terracotta", pulse: false },
  critical: { border: "border-red-400/70",    text: "text-red-400",    pulse: true  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default async function DogTicker() {
  const { dogs } = await getDogs();

  if (dogs.length === 0) return null;

  // Sort by longest waiting first
  const sorted = [...dogs].sort(
    (a, b) =>
      new Date(a.intake_date || a.date_added).getTime() -
      new Date(b.intake_date || b.date_added).getTime()
  );

  const duration = Math.max(20, sorted.length * 8);

  const items = sorted.map((dog) => {
    const photo = [...(dog.photos || [])]
      .sort((a, b) => a.order - b.order)
      .at(0);
    const days = daysInShelter(dog.intake_date, dog.date_added);
    const intakeDate = new Date(dog.intake_date || dog.date_added);
    const urgency = getUrgency(days);
    const rings = ringCount[urgency];
    const style = ringStyles[urgency];
    const phrase = formatSeason(days, intakeDate);

    const containerSize = 28 + rings * 4;

    return (
      <Link
        key={dog.uid}
        href={`/dogs/${dog.slug}`}
        className="inline-flex items-center gap-3 px-6 text-sand-100 hover:text-white transition-colors whitespace-nowrap group"
      >
        {/* Ring system wrapping photo */}
        <span
          className="relative shrink-0 flex items-center justify-center"
          style={{ width: `${containerSize}px`, height: `${containerSize}px` }}
        >
          {Array.from({ length: rings }, (_, i) => (
            <span
              key={i}
              className={`absolute rounded-full border-[1.5px] ${style.border} ${
                i === rings - 1 && style.pulse
                  ? "animate-[ring-pulse_3s_ease-in-out_infinite]"
                  : ""
              }`}
              style={{
                inset: `${(rings - 1 - i) * 2}px`,
                opacity: 1 - i * 0.2,
              }}
            />
          ))}
          {photo && (
            <img
              src={photo.url}
              alt=""
              className="w-6 h-6 rounded-full object-cover relative z-10"
            />
          )}
        </span>

        {/* Name + seasonal phrase stacked */}
        <span className="flex flex-col leading-tight">
          <span className="font-heading font-semibold text-xs">
            {dog.title}
          </span>
          <span className={`text-[11px] ${style.text}`}>{phrase}</span>
        </span>
      </Link>
    );
  });

  return (
    <div
      className="bg-charcoal overflow-hidden py-2.5"
      aria-label="Dogs waiting for adoption"
      role="marquee"
    >
      <div
        className="ticker-track flex w-max"
        style={{ animation: `ticker-scroll ${duration}s linear infinite` }}
      >
        {items}
        {items}
      </div>
    </div>
  );
}
