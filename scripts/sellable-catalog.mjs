export const sellable_catalog = [
  {
    slug: "voice-starter",
    name: "Voice Agent Starter",
    cents: 9900,
    interval: "month",
  },
  {
    slug: "voice-growth",
    name: "Voice Agent Growth",
    cents: 29900,
    interval: "month",
  },
  {
    slug: "biasguards-pro",
    name: "BiasGuards Pro",
    cents: 2900,
    interval: "month",
  },
  {
    slug: "consciousness-mcp",
    name: "Consciousness MCP",
    cents: 29900,
    interval: "month",
  },
  {
    slug: "aiguardian-basic",
    name: "AiGuardian Suite - Basic",
    cents: 9900,
    interval: "month",
  },
  {
    slug: "aiguardian-pro",
    name: "AiGuardian Suite - Pro",
    cents: 29900,
    interval: "month",
  },
  {
    slug: "advancedring-agent",
    name: "AdvancedRing Agent",
    cents: 2000,
    interval: "month",
  },
  {
    slug: "advancedring-leader",
    name: "AdvancedRing Leader",
    cents: 8000,
    interval: "month",
  },
  {
    slug: "domain-reservation",
    name: "Premium Ai Domain Reservation",
    cents: 9900,
    interval: null,
  },
];

export const sellable_catalog_by_slug = new Map(
  sellable_catalog.map((product) => [product.slug, product]),
);
