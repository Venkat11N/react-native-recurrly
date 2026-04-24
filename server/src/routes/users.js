import { clerkClient } from "@clerk/express";
import { Router } from "express";
import { userDb } from "../lib/db.js";

const router = Router();

// Clerk webhook endpoint to sync users
router.post("/clerk/webhook", async (req, res) => {
  try {
    const { type, data } = req.body;

    switch (type) {
      case "user.created":
        // Create user in database when Clerk user is created
        const newUser = await userDb.create({
          clerkId: data.id,
          email: data.email_addresses[0]?.email_address || "",
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
        });
        console.log("User created:", newUser);
        break;

      case "user.updated":
        // Update user in database when Clerk user is updated
        const updatedUser = await userDb.update(data.id, {
          email: data.email_addresses[0]?.email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
        });
        console.log("User updated:", updatedUser);
        break;

      case "user.deleted":
        // Delete user from database when Clerk user is deleted
        await userDb.delete(data.id);
        console.log("User deleted:", data.id);
        break;

      default:
        console.log("Unhandled event type:", type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
});

// Sync current user (for manual sync if needed)
router.post("/sync", async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const clerkUser = await clerkClient.users.getUser(auth.userId);

    const existingUser = await userDb.findByClerkId(auth.userId);

    let user;
    if (existingUser) {
      user = await userDb.update(auth.userId, {
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      });
    } else {
      user = await userDb.create({
        clerkId: auth.userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
});

export default router;
