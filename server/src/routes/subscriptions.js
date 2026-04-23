import { Router } from "express";
import { subscriptionDb } from "../lib/db.js";

const router = Router();

// Get all subscriptions for the authenticated user
router.get("/", async (req, res) => {
  try {
    console.log("GET /api/subscriptions - Request received");
    // Temporarily skip auth for testing
    const subscriptions = await subscriptionDb.findMany();
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
    // Temporarily skip auth for testing
    const subscription = await subscriptionDb.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
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
    // Temporarily skip auth for testing
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
      userId: "temp_user", // Temporary user ID
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
    // Temporarily skip auth for testing
    const subscription = await subscriptionDb.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
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
    // Temporarily skip auth for testing
    const subscription = await subscriptionDb.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    await subscriptionDb.delete(req.params.id);
    res.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).json({ error: "Failed to delete subscription" });
  }
});

export default router;
