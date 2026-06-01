import { Link, useParams } from "react-router-dom";
import { ChevronRight, FileText, Network, KeyRound, MessageSquare, ArrowLeft } from "lucide-react";
import { SD_TOPIC_BY_ID } from "@/data/systemDesign.js";
import PlaceholderPanel, { SkeletonLines } from "@/components/PlaceholderPanel.jsx";

const ACCENT = "#d97706";

export default function SystemDesignTopic() {
  const { topicId } = useParams();
  const topic = SD_TOPIC_BY_ID[topicId];

  if (!topic) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Topic not found</h1>
        <Link to="/system-design" className="btn-primary mt-6" style={{ backgroundColor: ACCENT }}>
          <ArrowLeft className="h-4 w-4" /> Back to System Design
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link to="/system-design" className="hover:text-sysd">
          System Design
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>{topic.sectionTitle}</span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">{topic.title}</h1>
        <span className="chip border" style={{ color: ACCENT, backgroundColor: `${ACCENT}14`, borderColor: `${ACCENT}33` }}>
          {topic.tag}
        </span>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <PlaceholderPanel icon={FileText} title="Concept Explanation" accent={ACCENT} hint="A from-scratch explanation will live here.">
          <SkeletonLines lines={5} />
        </PlaceholderPanel>

        <PlaceholderPanel icon={Network} title="Architecture Diagram" accent={ACCENT} hint="An interactive/annotated diagram will render here.">
          <div className="grid h-44 place-items-center rounded-xl border border-dashed" style={{ borderColor: "rgb(var(--border-strong))" }}>
            <div className="text-center">
              <Network className="mx-auto h-8 w-8 text-faint" />
              <p className="mt-2 text-xs text-faint">Diagram canvas</p>
            </div>
          </div>
        </PlaceholderPanel>

        <PlaceholderPanel icon={KeyRound} title="Key Interview Points" accent={ACCENT}>
          <ul className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: ACCENT }} />
                <span className="skeleton h-3.5 flex-1" style={{ maxWidth: `${80 - i * 8}%` }} />
              </li>
            ))}
          </ul>
        </PlaceholderPanel>

        <PlaceholderPanel icon={MessageSquare} title="Common Interview Questions" accent={ACCENT}>
          <ol className="space-y-3">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex gap-2">
                <span className="font-mono text-xs text-faint">{i + 1}.</span>
                <span className="skeleton h-3.5 flex-1" style={{ maxWidth: `${90 - i * 10}%` }} />
              </li>
            ))}
          </ol>
        </PlaceholderPanel>
      </div>
    </div>
  );
}
