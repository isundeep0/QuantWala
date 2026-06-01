import { Link, useParams } from "react-router-dom";
import { ChevronRight, FileText, Code2, BarChart3, MessageSquare, ArrowLeft } from "lucide-react";
import { HFT_TOPIC_BY_ID } from "@/data/hft.js";
import PlaceholderPanel, { SkeletonLines } from "@/components/PlaceholderPanel.jsx";
import CodeBlock from "@/components/CodeBlock.jsx";

const ACCENT = "#059669";

const SAMPLE_CPP = `// Placeholder — real low-latency snippets land here.
struct alignas(64) Order {        // cache-line aligned, avoid false sharing
    uint64_t id;
    int64_t  price_ticks;
    uint32_t qty;
    Side     side;
};

// Hot path: no allocation, no branching surprises.
inline void on_tick(const MarketData& md) noexcept {
    const auto edge = signal_.update(md);   // branchless, inlined
    if (edge > threshold_) [[unlikely]] router_.send(build_order(md));
}`;

export default function HFTTopic() {
  const { topicId } = useParams();
  const topic = HFT_TOPIC_BY_ID[topicId];

  if (!topic) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Topic not found</h1>
        <Link to="/hft" className="btn-primary mt-6" style={{ backgroundColor: ACCENT }}>
          <ArrowLeft className="h-4 w-4" /> Back to HFT
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link to="/hft" className="hover:text-hft">
          HFT / Low Latency
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>{topic.sectionTitle}</span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">{topic.title}</h1>
        <span className="chip border font-mono" style={{ color: ACCENT, backgroundColor: `${ACCENT}14`, borderColor: `${ACCENT}33` }}>
          {topic.tag}
        </span>
      </div>

      <div className="mt-8 space-y-5">
        <PlaceholderPanel icon={FileText} title="Concept" accent={ACCENT} hint="A deep, engineering-first explanation will live here.">
          <SkeletonLines lines={5} />
        </PlaceholderPanel>

        <section className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}>
              <Code2 className="h-4 w-4" />
            </span>
            <h3 className="font-semibold">Code Snippet</h3>
            <span className="ml-auto chip surface-sunken text-faint">Placeholder · C++ / Python</span>
          </div>
          <CodeBlock code={SAMPLE_CPP} language="cpp" title="example.cpp" />
        </section>

        <PlaceholderPanel icon={BarChart3} title="Benchmark / Comparison" accent={ACCENT} hint="Latency tables and throughput comparisons will render here.">
          <div className="overflow-hidden rounded-xl border" style={{ borderColor: "rgb(var(--border))" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="surface-sunken text-left">
                  <th className="px-4 py-2.5 font-semibold">Approach</th>
                  <th className="px-4 py-2.5 font-semibold">p50 (ns)</th>
                  <th className="px-4 py-2.5 font-semibold">p99 (ns)</th>
                  <th className="px-4 py-2.5 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2].map((i) => (
                  <tr key={i} className="border-t" style={{ borderColor: "rgb(var(--border))" }}>
                    {[0, 1, 2, 3].map((j) => (
                      <td key={j} className="px-4 py-3">
                        <span className="skeleton block h-3.5" style={{ maxWidth: j === 3 ? "90%" : "60%" }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PlaceholderPanel>

        <PlaceholderPanel icon={MessageSquare} title="Interview Questions" accent={ACCENT}>
          <ol className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="flex gap-2">
                <span className="font-mono text-xs text-faint">{i + 1}.</span>
                <span className="skeleton h-3.5 flex-1" style={{ maxWidth: `${92 - i * 9}%` }} />
              </li>
            ))}
          </ol>
        </PlaceholderPanel>
      </div>
    </div>
  );
}
