import { clerkClient } from "@clerk/express";
import { Router } from "express";
import { subscriptionDb } from "../lib/db.js";

const router = Router();

// Helper to extract user ID from Authorization header
const getUserIdFromToken = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    // Verify the token with Clerk to get the user ID
    const decoded = await clerkClient.verifyToken(token);
    return decoded.sub;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
};

// Get upcoming subscriptions for the next 7 days
router.get("/upcoming", async (req, res) => {
  try {
    const clerkId = await getUserIdFromToken(req.headers.authorization);
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userDb } = await import("../lib/db.js");
    let user = await userDb.findByClerkId(clerkId);

    // Auto-create user if they don't exist
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        user = await userDb.create({
          clerkId: clerkId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        });
      } catch (clerkError) {
        console.error("Error fetching user from Clerk:", clerkError);
        return res.status(404).json({ error: "User not found" });
      }
    }

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const allSubscriptions = await subscriptionDb.findMany({ userId: user.id });
    const upcomingSubscriptions = allSubscriptions
      .filter(
        (sub) =>
          sub.status === "active" &&
          new Date(sub.renewalDate) >= today &&
          new Date(sub.renewalDate) <= nextWeek,
      )
      .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate));

    const formatted = upcomingSubscriptions.map((sub) => {
      const daysLeft = Math.ceil(
        (new Date(sub.renewalDate) - today) / (1000 * 60 * 60 * 24),
      );
      return {
        id: sub.id,
        name: sub.name,
        price: sub.price,
        currency: sub.currency || "USD",
        renewalDate: sub.renewalDate,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        status:
          daysLeft === 0
            ? "Due Today"
            : daysLeft === 1
              ? "Tomorrow"
              : "Upcoming",
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching upcoming subscriptions:", error);
    res.status(500).json({ error: "Failed to fetch upcoming subscriptions" });
  }
});

// Get monthly history
router.get("/history", async (req, res) => {
  try {
    const clerkId = await getUserIdFromToken(req.headers.authorization);
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userDb } = await import("../lib/db.js");
    let user = await userDb.findByClerkId(clerkId);

    // Auto-create user if they don't exist
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        user = await userDb.create({
          clerkId: clerkId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        });
      } catch (clerkError) {
        console.error("Error fetching user from Clerk:", clerkError);
        return res.status(404).json({ error: "User not found" });
      }
    }

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const allSubscriptions = await subscriptionDb.findMany({ userId: user.id });
    const historySubscriptions = allSubscriptions
      .filter(
        (sub) =>
          new Date(sub.renewalDate) >= monthStart &&
          new Date(sub.renewalDate) < today,
      )
      .sort((a, b) => new Date(b.renewalDate) - new Date(a.renewalDate));

    const formatted = historySubscriptions.map((sub) => ({
      id: sub.id,
      name: sub.name,
      price: sub.price,
      currency: sub.currency || "USD",
      renewalDate: sub.renewalDate,
      status: "Paid",
    }));

    const monthlyTotal = formatted.reduce(
      (sum, sub) => sum + parseFloat(sub.price),
      0,
    );

    res.json({
      subscriptions: formatted,
      monthlyTotal,
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Get weekly chart data
router.get("/weekly-chart", async (req, res) => {
  try {
    const clerkId = await getUserIdFromToken(req.headers.authorization);
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userDb } = await import("../lib/db.js");
    let user = await userDb.findByClerkId(clerkId);

    // Auto-create user if they don't exist
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        user = await userDb.create({
          clerkId: clerkId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        });
      } catch (clerkError) {
        console.error("Error fetching user from Clerk:", clerkError);
        return res.status(404).json({ error: "User not found" });
      }
    }

    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }

    const allSubscriptions = await subscriptionDb.findMany({ userId: user.id });

    const chartData = days.map((day) => {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const daySubscriptions = allSubscriptions.filter(
        (sub) =>
          sub.status === "active" &&
          new Date(sub.renewalDate) >= dayStart &&
          new Date(sub.renewalDate) <= dayEnd,
      );

      const totalCost = daySubscriptions.reduce(
        (sum, sub) => sum + parseFloat(sub.price),
        0,
      );
      const isToday = day.toDateString() === today.toDateString();

      return {
        day: day.toLocaleDateString("en-US", { weekday: "short" }),
        value: totalCost,
        highlighted: isToday,
        badge:
          isToday && totalCost > 0 ? `$${totalCost.toFixed(0)}` : undefined,
      };
    });

    res.json(chartData);
  } catch (error) {
    console.error("Error fetching weekly chart data:", error);
    res.status(500).json({ error: "Failed to fetch weekly chart data" });
  }
});

export default router;
