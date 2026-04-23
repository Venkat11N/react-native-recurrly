import dayjs from "dayjs";

export const formatCurrency = (value: number, currency = "USD"): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
};

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format("MM/DD/YYYY")
    : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Icon mapping for subscription services - only maps to valid icon keys in constants/icons.ts
const ICON_MAPPING: Record<string, string> = {
  // Existing project icons
  spotify: "spotify",
  notion: "notion",
  figma: "figma",
  github: "github",
  claude: "claude",
  canva: "canva",
  adobe: "adobe",
  dropbox: "dropbox",
  openai: "openai",
  medium: "medium",
  netflix: "netflix",
  // Map common services to closest available icon
  disney: "netflix",
  hulu: "netflix",
  "amazon prime": "wallet",
  hbo: "netflix",
  apple: "wallet",
  youtube: "wallet",
  google: "wallet",
  microsoft: "github",
  xbox: "wallet",
  playstation: "wallet",
  nintendo: "wallet",
  steam: "wallet",
  twitch: "spotify",
  discord: "wallet",
  slack: "notion",
  zoom: "notion",
  linkedin: "github",
  twitter: "wallet",
  x: "wallet",
  facebook: "wallet",
  instagram: "wallet",
  tiktok: "spotify",
  snapchat: "wallet",
  pinterest: "wallet",
  reddit: "wallet",
  telegram: "wallet",
  whatsapp: "wallet",
  duolingo: "wallet",
  coursera: "notion",
  udemy: "notion",
  skillshare: "canva",
  masterclass: "notion",
  codecademy: "github",
  mailchimp: "wallet",
  hubspot: "notion",
  salesforce: "notion",
  zendesk: "wallet",
  intercom: "wallet",
  airtable: "notion",
  monday: "notion",
  asana: "notion",
  trello: "notion",
  jira: "github",
  confluence: "notion",
  basecamp: "notion",
  clickup: "notion",
  todoist: "notion",
  sketch: "figma",
  shopify: "wallet",
  squarespace: "wallet",
  wix: "wallet",
  wordpress: "wallet",
  godaddy: "wallet",
  aws: "dropbox",
  azure: "dropbox",
  heroku: "dropbox",
  digitalocean: "dropbox",
  vercel: "github",
  netlify: "github",
  firebase: "dropbox",
  supabase: "dropbox",
  mongodb: "dropbox",
  postgresql: "dropbox",
  mysql: "dropbox",
  redis: "dropbox",
  tableau: "notion",
  powerbi: "notion",
  datadog: "notion",
  newrelic: "notion",
  sentry: "github",
  pagerduty: "notion",
  atlassian: "notion",
  patreon: "wallet",
  etsy: "wallet",
  gumroad: "wallet",
};

export const getSubscriptionIcon = (name: string): string => {
  const normalizedName = name.toLowerCase().trim();

  // Direct match
  if (ICON_MAPPING[normalizedName]) {
    return ICON_MAPPING[normalizedName];
  }

  // Partial match
  for (const [key, value] of Object.entries(ICON_MAPPING)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }

  // Fallback to wallet icon name
  return "wallet";
};
