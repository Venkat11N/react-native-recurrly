import { icons } from "@/constants/icons";
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

// Comprehensive icon mapping for subscription services
const ICON_MAPPING: Record<string, any> = {
  // Existing project icons
  spotify: icons.spotify,
  notion: icons.notion,
  figma: icons.figma,
  github: icons.github,
  claude: icons.claude,
  canva: icons.canva,
  adobe: icons.adobe,
  dropbox: icons.dropbox,
  openai: icons.openai,
  medium: icons.medium,
  netflix: icons.netflix,

  // Emoji fallbacks for common services
  disney: "🏰",
  hulu: "📺",
  "amazon prime": "📦",
  hbo: "🎭",
  apple: "🍎",
  youtube: "▶️",
  google: "🔍",
  microsoft: "💻",
  xbox: "🎮",
  playstation: "🎮",
  nintendo: "🎮",
  steam: "🎮",
  twitch: "📺",
  discord: "💬",
  slack: "💬",
  zoom: "📹",
  linkedin: "💼",
  twitter: "🐦",
  x: "𝕏",
  facebook: "📘",
  instagram: "📷",
  tiktok: "🎵",
  snapchat: "👻",
  pinterest: "📌",
  reddit: "🤖",
  telegram: "✈️",
  whatsapp: "💬",
  duolingo: "🦉",
  coursera: "📚",
  udemy: "📚",
  skillshare: "🎨",
  masterclass: "🎓",
  codecademy: "💻",
  mailchimp: "📧",
  hubspot: "🧲",
  salesforce: "☁️",
  zendesk: "💬",
  intercom: "💬",
  airtable: "📊",
  monday: "📅",
  asana: "✅",
  trello: "📋",
  jira: "🐾",
  confluence: "📄",
  basecamp: "⛺",
  clickup: "📋",
  todoist: "✅",
  sketch: "🎨",
  shopify: "🛒",
  squarespace: "🌐",
  wix: "🌐",
  wordpress: "📝",
  godaddy: "🌐",
  aws: "☁️",
  azure: "☁️",
  heroku: "🔷",
  digitalocean: "🐋",
  vercel: "▲",
  netlify: "🟢",
  firebase: "🔥",
  supabase: "🟢",
  mongodb: "🍃",
  postgresql: "🐘",
  mysql: "🐬",
  redis: "🔴",
  tableau: "📊",
  powerbi: "📊",
  datadog: "🐶",
  newrelic: "👁️",
  sentry: "🔨",
  pagerduty: "📟",
  atlassian: "🔷",
  patreon: "💰",
  etsy: "🛍️",
  gumroad: "🛒",
};

export const getSubscriptionIcon = (name: string): string => {
  const normalizedName = name.toLowerCase().trim();

  // Direct match - return the key name instead of the icon itself
  if (ICON_MAPPING[normalizedName]) {
    return normalizedName;
  }

  // Partial match - return the key name
  for (const [key] of Object.entries(ICON_MAPPING)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return key;
    }
  }

  // Fallback to wallet icon name
  return "wallet";
};
