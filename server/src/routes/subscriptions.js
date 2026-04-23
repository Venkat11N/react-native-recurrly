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
    console.log("Request body:", req.body);
    // Temporarily skip auth for testing
    const { name, price, frequency, category, icon, renewalDate, startDate } =
      req.body;

    const subscription = await subscriptionDb.create({
      userId: "temp_user", // Temporary user ID
      name,
      price: parseFloat(price),
      frequency,
      category,
      icon,
      renewalDate: new Date(renewalDate).toISOString(),
      startDate: startDate
        ? new Date(startDate).toISOString()
        : new Date().toISOString(),
    });

    console.log("Subscription created:", subscription);
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
    if (name) updateData.name = name;
    if (price) updateData.price = parseFloat(price);
    if (frequency) updateData.frequency = frequency;
    if (category) updateData.category = category;
    if (icon) updateData.icon = icon;
    if (renewalDate)
      updateData.renewalDate = new Date(renewalDate).toISOString();
    if (status) updateData.status = status;

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
