import { useAuth } from "@clerk/expo";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createSubscription,
  deleteSubscription,
  getSubscriptions,
  updateSubscription,
} from "../lib/apiClient";

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  price: number;
  currency: string;
  frequency: "Monthly" | "Yearly";
  category: string;
  icon?: string;
  status: string;
  renewalDate: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  // Additional properties for compatibility with components
  plan?: string;
  billing?: "Monthly" | "Yearly";
  paymentMethod?: string;
  color?: string;
}

interface SubscriptionsContextType {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  refreshSubscriptions: () => Promise<void>;
  addSubscription: (
    subscription: Omit<
      Subscription,
      "id" | "userId" | "createdAt" | "updatedAt"
    >,
  ) => Promise<void>;
  updateSubscriptionData: (
    id: string,
    data: Partial<Subscription>,
  ) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
}

const SubscriptionsContext = createContext<
  SubscriptionsContextType | undefined
>(undefined);

export function SubscriptionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const parsePrice = (price: any): number => {
    if (typeof price === "number") return price;
    if (!price) return 0;
    const cleanStr = String(price).trim();
    // Handle negative sign
    const isNegative = cleanStr.startsWith("-");
    const withoutSign = isNegative ? cleanStr.slice(1) : cleanStr;
    // Remove all dashes except the first one
    const withoutDashes = withoutSign.replace(/-/g, "");
    // Split on decimal point and keep only first one
    const parts = withoutDashes.split(".");
    const normalized =
      parts.length > 1
        ? parts[0] + "." + parts.slice(1).join("")
        : withoutDashes;
    const parsed = Number(normalized);
    // Clamp negatives to 0 for subscriptions
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  };

  const refreshSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        setError("Not authenticated");
        return;
      }
      const data = await getSubscriptions(token);
      const parsedData = data.map((sub: any) => ({
        ...sub,
        price: parsePrice(sub.price),
      }));
      setSubscriptions(parsedData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch subscriptions",
      );
      console.error("Error fetching subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  const addSubscription = async (
    subscription: Omit<
      Subscription,
      "id" | "userId" | "createdAt" | "updatedAt"
    >,
  ) => {
    try {
      const token = await getToken();
      if (!token) {
        setError("Not authenticated");
        throw new Error("Not authenticated");
      }
      await createSubscription(token, subscription);

      // Force a fresh sync to ensure state perfectly matches the database
      await refreshSubscriptions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create subscription",
      );
      console.error("Error adding subscription:", err);
      throw err;
    }
  };

  const updateSubscriptionData = async (
    id: string,
    data: Partial<Subscription>,
  ) => {
    try {
      const token = await getToken();
      if (!token) {
        setError("Not authenticated");
        throw new Error("Not authenticated");
      }
      await updateSubscription(token, id, data);

      await refreshSubscriptions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update subscription",
      );
      throw err;
    }
  };

  const removeSubscription = async (id: string) => {
    try {
      const token = await getToken();
      if (!token) {
        setError("Not authenticated");
        throw new Error("Not authenticated");
      }
      await deleteSubscription(token, id);
      await refreshSubscriptions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete subscription",
      );
      throw err;
    }
  };

  useEffect(() => {
    refreshSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
        loading,
        error,
        refreshSubscriptions,
        addSubscription,
        updateSubscriptionData,
        removeSubscription,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error(
      "useSubscriptions must be used within a SubscriptionsProvider",
    );
  }
  return context;
}
