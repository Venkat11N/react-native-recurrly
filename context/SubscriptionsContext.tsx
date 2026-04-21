import { HOME_SUBSCRIPTIONS, type Subscription } from "@/constants/data";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface SubscriptionsContextType {
  subscriptions: Subscription[];
  addSubscription: (subscription: any) => void;
}

const SubscriptionsContext = createContext<
  SubscriptionsContextType | undefined
>(undefined);

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  const addSubscription = (subscription: any) => {
    setSubscriptions((prev) => [subscription, ...prev]);
  };

  return (
    <SubscriptionsContext.Provider value={{ subscriptions, addSubscription }}>
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (context === undefined) {
    throw new Error(
      "useSubscriptions must be used within a SubscriptionsProvider",
    );
  }
  return context;
}
