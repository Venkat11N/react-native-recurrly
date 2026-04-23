import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, "subscriptions.json");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (_error) {
    // Directory might already exist
  }
}

// Initialize data files if they don't exist
async function initDataFiles() {
  await ensureDataDir();

  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, "[]");
  }

  try {
    await fs.access(SUBSCRIPTIONS_FILE);
  } catch {
    await fs.writeFile(SUBSCRIPTIONS_FILE, "[]");
  }
}

// Read users from file
async function getUsers() {
  await initDataFiles();
  const data = await fs.readFile(USERS_FILE, "utf-8");
  return JSON.parse(data);
}

// Write users to file
async function saveUsers(users) {
  await initDataFiles();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// Read subscriptions from file
async function getSubscriptions() {
  await initDataFiles();
  const data = await fs.readFile(SUBSCRIPTIONS_FILE, "utf-8");
  return JSON.parse(data);
}

// Write subscriptions to file
async function saveSubscriptions(subscriptions) {
  await initDataFiles();
  await fs.writeFile(
    SUBSCRIPTIONS_FILE,
    JSON.stringify(subscriptions, null, 2),
  );
}

// User operations
export const userDb = {
  async findByClerkId(clerkId) {
    const users = await getUsers();
    return users.find((u) => u.clerkId === clerkId);
  },

  async create(userData) {
    const users = await getUsers();
    const newUser = {
      id: `user_${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    await saveUsers(users);
    return newUser;
  },

  async update(clerkId, userData) {
    const users = await getUsers();
    const index = users.findIndex((u) => u.clerkId === clerkId);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    await saveUsers(users);
    return users[index];
  },

  async delete(clerkId) {
    const users = await getUsers();
    const filtered = users.filter((u) => u.clerkId !== clerkId);
    await saveUsers(filtered);
  },
};

// Subscription operations
export const subscriptionDb = {
  async findByUserId(userId) {
    const subscriptions = await getSubscriptions();
    return subscriptions.filter((s) => s.userId === userId);
  },

  async findById(id) {
    const subscriptions = await getSubscriptions();
    return subscriptions.find((s) => s.id === id);
  },

  async create(subscriptionData) {
    const subscriptions = await getSubscriptions();
    const newSubscription = {
      id: `sub_${Date.now()}`,
      ...subscriptionData,
      status: subscriptionData.status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    subscriptions.push(newSubscription);
    await saveSubscriptions(subscriptions);
    return newSubscription;
  },

  async update(id, subscriptionData) {
    const subscriptions = await getSubscriptions();
    const index = subscriptions.findIndex((s) => s.id === id);
    if (index === -1) return null;

    subscriptions[index] = {
      ...subscriptions[index],
      ...subscriptionData,
      updatedAt: new Date().toISOString(),
    };
    await saveSubscriptions(subscriptions);
    return subscriptions[index];
  },

  async delete(id) {
    const subscriptions = await getSubscriptions();
    const filtered = subscriptions.filter((s) => s.id !== id);
    await saveSubscriptions(filtered);
  },

  async findMany(filters = {}) {
    const subscriptions = await getSubscriptions();
    let filtered = subscriptions;

    if (filters.userId) {
      filtered = filtered.filter((s) => s.userId === filters.userId);
    }

    if (filters.status) {
      filtered = filtered.filter((s) => s.status === filters.status);
    }

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter((s) => {
        const renewalDate = new Date(s.renewalDate);
        return (
          renewalDate >= new Date(filters.startDate) &&
          renewalDate <= new Date(filters.endDate)
        );
      });
    }

    return filtered;
  },
};
