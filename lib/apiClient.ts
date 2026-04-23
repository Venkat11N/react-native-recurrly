import { Platform } from "react-native";

// Use environment variable if set, otherwise use platform defaults
const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\s+/g, "") ||
  (__DEV__
    ? Platform.OS === "android"
      ? "http://10.0.2.2:3001/api"
      : "http://localhost:3001/api"
    : "http://localhost:3001/api");

console.log("API URL:", API_URL);
console.log("Platform:", Platform.OS);
console.log("Environment variable:", process.env.EXPO_PUBLIC_API_URL);

async function request(
  endpoint: string,
  token: string | null,
  options: RequestInit = {},
) {
  const fullUrl = `${API_URL}${endpoint}`;
  console.log("Fetching:", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("API request error:", error);
    console.error("Full URL was:", fullUrl);
    throw error;
  }
}

// Subscriptions
export async function getSubscriptions(token: string | null) {
  return request("/subscriptions", token);
}

export async function createSubscription(token: string | null, data: any) {
  return request("/subscriptions", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSubscription(
  token: string | null,
  id: string,
  data: any,
) {
  return request(`/subscriptions/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSubscription(token: string | null, id: string) {
  return request(`/subscriptions/${id}`, token, {
    method: "DELETE",
  });
}

// Insights
export async function getUpcoming(token: string | null) {
  return request("/insights/upcoming", token);
}

export async function getHistory(token: string | null) {
  return request("/insights/history", token);
}

export async function getWeeklyChart(token: string | null) {
  return request("/insights/weekly-chart", token);
}

// Users
export async function syncUser(token: string | null) {
  return request("/users/sync", token, {
    method: "POST",
  });
}
