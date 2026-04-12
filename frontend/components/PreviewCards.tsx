import type { ReactNode } from "react";

type Accent = "red" | "blue" | "yellow";
type Shape = "circle" | "square" | "triangle";
type ListEntry = {
  term: string;
  detail: string;
};
type CardSection = {
  label: string;
  title: string;
  accent: Accent;
  shape: Shape;
  wide?: boolean;
  summary?: boolean;
  description?: string;
  stats?: string[];
  columns?: ListEntry[][];
  columnsGapClassName?: string;
};

const ACCENT_MAP: Record<Accent, string> = {
  red: "bg-bh-red",
  blue: "bg-bh-blue",
  yellow: "bg-bh-yellow",
};

const BORDER_MAP: Record<Accent, string> = {
  red: "border-l-bh-red",
  blue: "border-l-bh-blue",
  yellow: "border-l-bh-yellow",
};

const RESULTS_HEADING = "Results — Rate Limiter";

const CARD_SECTIONS: CardSection[] = [
  {
    label: "Summary",
    title: "Token-Bucket Rate Limiter",
    accent: "yellow",
    shape: "circle",
    wide: true,
    summary: true,
    description:
      "A distributed rate limiter using the token-bucket algorithm. Each client key maintains a bucket that refills at a fixed rate. Requests consume tokens; when the bucket is empty, requests are rejected or queued. Backed by Redis for cross-node consistency.",
    stats: ["p99 < 8ms", "10k rps / node", "Redis-backed"],
  },
  {
    label: "Requirements",
    title: "Functional & Non-Functional",
    accent: "blue",
    shape: "square",
    columns: [
      [
        {
          term: "Rate accuracy",
          detail: "enforce limits within 1% error margin",
        },
        {
          term: "Low latency",
          detail: "sub-10ms p99 on allow/deny decisions",
        },
        {
          term: "Distributed",
          detail: "consistent enforcement across all nodes",
        },
        {
          term: "Configurable",
          detail: "per-client and per-endpoint rate policies",
        },
      ],
    ],
  },
  {
    label: "Components",
    title: "Building Blocks",
    accent: "blue",
    shape: "triangle",
    columns: [
      [
        {
          term: "API Gateway",
          detail: "request entry point, extracts client key",
        },
        {
          term: "Limiter Service",
          detail: "token-bucket logic, allow/deny",
        },
        {
          term: "Redis Cluster",
          detail: "shared token state across nodes",
        },
        {
          term: "Config Service",
          detail: "manages per-client rate policies",
        },
        {
          term: "Metrics Sink",
          detail: "tracks rejection rates and usage",
        },
      ],
    ],
  },
  {
    label: "Tradeoffs",
    title: "What You Give Up",
    accent: "red",
    shape: "circle",
    columns: [
      [
        {
          term: "Strong consistency",
          detail: "Redis adds a network hop on every check",
        },
        {
          term: "Operational cost",
          detail: "running and monitoring a Redis cluster",
        },
        {
          term: "Burst boundary",
          detail: "fixed buckets allow short spikes at refill edges",
        },
      ],
    ],
  },
  {
    label: "Bottlenecks",
    title: "Where It Breaks",
    accent: "red",
    shape: "square",
    columns: [
      [
        {
          term: "Redis throughput",
          detail: "single-threaded, ~100k ops/s per node",
        },
        {
          term: "Hot keys",
          detail: "popular clients create contention on single keys",
        },
        {
          term: "Network partition",
          detail: "nodes can't reach Redis, must fail-open or closed",
        },
      ],
    ],
  },
  {
    label: "Failure Modes",
    title: "When Things Go Wrong",
    accent: "red",
    shape: "triangle",
    wide: true,
    columns: [
      [
        {
          term: "Redis down",
          detail: "fail-open risks abuse; fail-closed blocks all traffic",
        },
        {
          term: "Clock skew",
          detail: "inconsistent refill timing across nodes",
        },
      ],
      [
        {
          term: "Stale config",
          detail: "policy updates lag, causing over/under-limiting",
        },
        {
          term: "Memory pressure",
          detail: "too many keys evicted from Redis",
        },
      ],
    ],
    columnsGapClassName: "gap-2.5",
  },
  {
    label: "Scaling Strategies",
    title: "How to Grow",
    accent: "blue",
    shape: "circle",
    wide: true,
    columns: [
      [
        {
          term: "Shard by key",
          detail: "partition buckets across Redis nodes",
        },
        {
          term: "Local cache",
          detail: "keep fast-path counters in-process, sync periodically",
        },
        {
          term: "Sliding window",
          detail: "swap fixed buckets for sliding-window counters",
        },
      ],
      [
        {
          term: "Rate tiering",
          detail: "separate fast/slow paths for premium vs free users",
        },
        {
          term: "Circuit breaker",
          detail: "shed load to prevent cascading Redis failures",
        },
        {
          term: "Async refill",
          detail:
            "background refill with jitter to prevent thundering herd",
        },
      ],
    ],
    columnsGapClassName: "gap-4",
  },
];

function GeoShape({ shape, accent }: { shape: Shape; accent: Accent }) {
  if (shape === "circle")
    return <div className={`geo-circle ${ACCENT_MAP[accent]}`} />;
  if (shape === "square")
    return <div className={`geo-square ${ACCENT_MAP[accent]}`} />;
  return <div className="geo-triangle text-bh-yellow" />;
}

function Card({
  label,
  title,
  accent,
  shape,
  wide,
  summary,
  children,
}: {
  label: string;
  title: string;
  accent: Accent;
  shape: Shape;
  wide?: boolean;
  summary?: boolean;
  children: ReactNode;
}) {
  if (summary) {
    return (
      <article className="relative border-3 border-fg bg-bh-yellow shadow-hard-lg md:col-span-2">
        <div className="absolute right-4 top-4">
          <GeoShape shape={shape} accent="red" />
        </div>
        <div className="p-6 sm:p-8">
          <p className="mb-1 inline-block bg-fg px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-bh-yellow">
            {label}
          </p>
          <h3 className="mb-4 mt-3 text-xl font-extrabold uppercase tracking-tight sm:text-2xl">
            {title}
          </h3>
          <div className="text-sm leading-relaxed text-fg/80">{children}</div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`card-lift relative border-2 border-fg border-l-[5px] ${BORDER_MAP[accent]} bg-card shadow-hard ${
        wide ? "md:col-span-2" : ""
      }`}
    >
      <div className="absolute right-3 top-3">
        <GeoShape shape={shape} accent={accent} />
      </div>

      <div className="p-5">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted">
          {label}
        </p>
        <h3 className="mb-4 text-base font-bold uppercase tracking-tight">
          {title}
        </h3>
        <div className="text-sm leading-relaxed text-fg/80">{children}</div>
      </div>
    </article>
  );
}

function ListItem({ term, detail }: ListEntry) {
  return (
    <li className="border-b border-fg/10 pb-2 last:border-b-0 last:pb-0">
      <span className="font-semibold text-fg">{term}</span>
      <span className="ml-1 text-fg/60">— {detail}</span>
    </li>
  );
}

function CardColumns({
  columns,
  columnsGapClassName = "gap-2.5",
}: {
  columns: ListEntry[][];
  columnsGapClassName?: string;
}) {
  if (columns.length === 1) {
    return (
      <ul className="flex flex-col gap-2.5">
        {columns[0].map((item) => (
          <ListItem key={`${item.term}-${item.detail}`} {...item} />
        ))}
      </ul>
    );
  }

  return (
    <div className={`grid grid-cols-1 ${columnsGapClassName} sm:grid-cols-2`}>
      {columns.map((column, index) => (
        <ul key={index} className="flex flex-col gap-2.5">
          {column.map((item) => (
            <ListItem key={`${item.term}-${item.detail}`} {...item} />
          ))}
        </ul>
      ))}
    </div>
  );
}

export default function PreviewCards() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-16 pt-2">
      <div className="mb-6 flex items-center gap-3 border-b-2 border-fg pb-3">
        <div className="h-3 w-3 bg-bh-blue" />
        <h2 className="text-xs font-bold uppercase tracking-[0.15em]">
          {RESULTS_HEADING}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CARD_SECTIONS.map((section) => {
          const { columns, columnsGapClassName, description, stats } = section;

          return (
            <Card
              key={section.title}
              label={section.label}
              title={section.title}
              accent={section.accent}
              shape={section.shape}
              wide={section.wide}
              summary={section.summary}
            >
              {description ? <p>{description}</p> : null}
              {columns ? (
                <CardColumns
                  columns={columns}
                  columnsGapClassName={columnsGapClassName}
                />
              ) : null}
              {stats ? (
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 border-t-2 border-fg/20 pt-3 font-mono text-xs font-bold uppercase tracking-wide text-fg/70">
                  {stats.map((stat) => (
                    <span key={stat}>{stat}</span>
                  ))}
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
