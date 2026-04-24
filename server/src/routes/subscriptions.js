import { clerkClient, verifyToken } from "@clerk/express";
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
    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    return decoded.sub;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
};

// Get all subscriptions for the authenticated user
router.get("/", async (req, res) => {
  try {
    console.log("GET /api/subscriptions - Request received");

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
        console.log("Auto-created user:", user.id);
      } catch (clerkError) {
        console.error("Error fetching user from Clerk:", clerkError);
        return res.status(404).json({ error: "User not found" });
      }
    }

    const subscriptions = await subscriptionDb.findMany({ userId: user.id });
    console.log("Subscriptions found:", subscriptions.length);

    res.json(
      subscriptions.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    );
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

// Get a single subscription by ID
router.get("/:id", async (req, res) => {
  try {
    const clerkId = await getUserIdFromToken(req.headers.authorization);
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userDb } = await import("../lib/db.js");
    const user = await userDb.findByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const subscription = await subscriptionDb.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    // Verify ownership
    if (subscription.userId !== user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

// Create a new subscription
router.post("/", async (req, res) => {
  try {
    console.log("POST /api/subscriptions - Request received");

    const clerkId = await getUserIdFromToken(req.headers.authorization);
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userDb } = await import("../lib/db.js");
    const user = await userDb.findByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { name, price, frequency, category, icon, renewalDate, startDate } =
      req.body;

    // Input validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Name is required and must be a non-empty string" });
    }

    if (price === undefined || price === null) {
      return res.status(400).json({ error: "Price is required" });
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      return res
        .status(400)
        .json({ error: "Price must be a valid positive number" });
    }

    if (!renewalDate || typeof renewalDate !== "string") {
      return res.status(400).json({ error: "Renewal date is required" });
    }

    const renewalTimestamp = Date.parse(renewalDate);
    if (isNaN(renewalTimestamp)) {
      return res
        .status(400)
        .json({ error: "Renewal date must be a valid date" });
    }

    const subscription = await subscriptionDb.create({
      userId: user.id,
      name: name.trim(),
      price: priceValue,
      frequency: frequency || "Monthly",
      category: category || "Other",
      icon: icon || "wallet",
      renewalDate: new Date(renewalDate).toISOString(),
      startDate:
        startDate && Date.parse(startDate) && !isNaN(Date.parse(startDate))
          ? new Date(startDate).toISOString()
          : new Date().toISOString(),
    });

    console.log("Subscription created:", subscription.id);
    res.status(201).json(subscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: "Failed to create subscription" });
  }
});

// Update a subscription
router.put("/:id", async (req, res) => {
  try {
    const clerkId = await getUserIdFromToken(req.headers.authorization);
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userDb } = await import("../lib/db.js");
    const user = await userDb.findByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const subscription = await subscriptionDb.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    // Verify ownership
    if (subscription.userId !== user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { name, price, frequency, category, icon, renewalDate, status } =
      req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (frequency !== undefined) updateData.frequency = frequency;
    if (category !== undefined) updateData.category = category;
    if (icon !== undefined) updateData.icon = icon;
    if (renewalDate !== undefined)
      updateData.renewalDate = new Date(renewalDate).toISOString();
    if (status !== undefined) updateData.status = status;

    const updatedSubscription = await subscriptionDb.update(
      req.params.id,
      updateData,
    );
    res.json(updatedSubscription);
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ error: "Failed to update subscription" });
  }
});

// Delete a subscription
router.delete("/:id", async (req, res) => {
  try {
    const clerkId = await getUserIdFromToken(req.headers.authorization);
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userDb } = await import("../lib/db.js");
    const user = await userDb.findByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const subscription = await subscriptionDb.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    // Verify ownership
    if (subscription.userId !== user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await subscriptionDb.delete(req.params.id);
    res.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).json({ error: "Failed to delete subscription" });
  }
});

export default router;
