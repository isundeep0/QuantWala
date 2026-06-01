// Module 2 — System Design. UI structure only; content is placeholder for now.
export const SD_SECTIONS = [
  {
    id: "fundamentals",
    title: "Fundamentals",
    blurb: "The vocabulary every system design answer is built on.",
    topics: [
      { id: "scalability", title: "Scalability, Availability, Consistency", tag: "Core" },
      { id: "cap-theorem", title: "CAP Theorem", tag: "Core" },
      { id: "base-acid", title: "BASE vs ACID", tag: "Core" },
      { id: "latency-throughput", title: "Latency vs Throughput", tag: "Core" },
    ],
  },
  {
    id: "core-components",
    title: "Core Components",
    blurb: "The building blocks you'll wire together on the whiteboard.",
    topics: [
      { id: "load-balancers", title: "Load Balancers", tag: "Infra" },
      { id: "cdn", title: "CDNs", tag: "Infra" },
      { id: "caching", title: "Caches — Redis & Memcached", tag: "Infra" },
      { id: "message-queues", title: "Message Queues — Kafka, RabbitMQ", tag: "Infra" },
      { id: "databases", title: "SQL vs NoSQL, Sharding, Replication", tag: "Data" },
      { id: "api-gateway", title: "API Gateway & Rate Limiting", tag: "Infra" },
    ],
  },
  {
    id: "classic-designs",
    title: "Classic System Designs",
    blurb: "The canonical questions, end to end.",
    topics: [
      { id: "url-shortener", title: "Design a URL Shortener", tag: "Design" },
      { id: "twitter", title: "Design Twitter", tag: "Design" },
      { id: "whatsapp", title: "Design WhatsApp", tag: "Design" },
      { id: "youtube", title: "Design YouTube", tag: "Design" },
      { id: "uber", title: "Design Uber", tag: "Design" },
      { id: "google-search", title: "Design Google Search", tag: "Design" },
      { id: "rate-limiter", title: "Design a Rate Limiter", tag: "Design" },
      { id: "notification-system", title: "Design a Notification System", tag: "Design" },
    ],
  },
  {
    id: "interview-frameworks",
    title: "Interview Frameworks",
    blurb: "A repeatable structure so you never freeze.",
    topics: [
      { id: "approach-framework", title: "How to Approach Any SD Question", tag: "Framework" },
      { id: "common-mistakes", title: "Common Mistakes to Avoid", tag: "Framework" },
      { id: "follow-ups", title: "Handling Follow-up Questions", tag: "Framework" },
    ],
  },
];

export const SD_TOPIC_BY_ID = Object.fromEntries(
  SD_SECTIONS.flatMap((s) => s.topics.map((t) => [t.id, { ...t, sectionTitle: s.title }])),
);
