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
      setSubscriptions(data);
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
      const newSubscription = await createSubscription(token, subscription);
      setSubscriptions((prev) => {
        return [newSubscription, ...prev];
      });
      // Don't call refreshSubscriptions here since we already updated local state
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create subscription",
      );
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
      const updatedSubscription = await updateSubscription(token, id, data);
      setSubscriptions((prev) => {
        return prev.map((sub) => (sub.id === id ? updatedSubscription : sub));
      });
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
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
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
