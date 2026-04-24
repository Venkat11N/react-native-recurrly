import pool from "./database.js";

// User operations
export const userDb = {
  async findByClerkId(clerkId) {
    const result = await pool.query("SELECT * FROM users WHERE clerk_id = $1", [
      clerkId,
    ]);
    return result.rows[0] || null;
  },

  async create(userData) {
    const id = `user_${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO users (id, clerk_id, email, first_name, last_name, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        id,
        userData.clerkId,
        userData.email,
        userData.firstName || null,
        userData.lastName || null,
        userData.imageUrl || null,
      ],
    );
    return result.rows[0];
  },

  async update(clerkId, userData) {
    const result = await pool.query(
      `UPDATE users 
       SET email = $1, first_name = $2, last_name = $3, image_url = $4, updated_at = CURRENT_TIMESTAMP
       WHERE clerk_id = $5
       RETURNING *`,
      [
        userData.email,
        userData.firstName || null,
        userData.lastName || null,
        userData.imageUrl || null,
        clerkId,
      ],
    );
    return result.rows[0] || null;
  },

  async delete(clerkId) {
    await pool.query("DELETE FROM users WHERE clerk_id = $1", [clerkId]);
  },
};

// Subscription operations
export const subscriptionDb = {
  async findByUserId(userId) {
    const result = await pool.query(
      "SELECT * FROM subscriptions WHERE user_id = $1",
      [userId],
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM subscriptions WHERE id = $1",
      [id],
    );
    const row = result.rows[0];
    if (!row) return null;

    // Convert snake_case to camelCase for frontend compatibility
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      price: row.price,
      currency: row.currency,
      frequency: row.frequency,
      category: row.category,
      icon: row.icon,
      renewalDate: row.renewal_date,
      startDate: row.start_date,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  async create(subscriptionData) {
    const id = `sub_${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO subscriptions (id, user_id, name, price, currency, frequency, category, icon, renewal_date, start_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        id,
        subscriptionData.userId,
        subscriptionData.name,
        subscriptionData.price,
        subscriptionData.currency || "USD",
        subscriptionData.frequency || "Monthly",
        subscriptionData.category || "Other",
        subscriptionData.icon || "wallet",
        subscriptionData.renewalDate,
        subscriptionData.startDate || new Date().toISOString(),
        subscriptionData.status || "active",
      ],
    );
    const row = result.rows[0];

    // Convert snake_case to camelCase for frontend compatibility
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      price: row.price,
      currency: row.currency,
      frequency: row.frequency,
      category: row.category,
      icon: row.icon,
      renewalDate: row.renewal_date,
      startDate: row.start_date,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  async update(id, subscriptionData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const updateMap = {
      name: "name",
      price: "price",
      currency: "currency",
      frequency: "frequency",
      category: "category",
      icon: "icon",
      renewalDate: "renewal_date",
      startDate: "start_date",
      status: "status",
    };

    for (const [key, dbField] of Object.entries(updateMap)) {
      if (subscriptionData[key] !== undefined) {
        fields.push(`${dbField} = $${paramIndex}`);
        values.push(subscriptionData[key]);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE subscriptions 
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    const row = result.rows[0];
    if (!row) return null;

    // Convert snake_case to camelCase for frontend compatibility
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      price: row.price,
      currency: row.currency,
      frequency: row.frequency,
      category: row.category,
      icon: row.icon,
      renewalDate: row.renewal_date,
      startDate: row.start_date,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  async delete(id) {
    await pool.query("DELETE FROM subscriptions WHERE id = $1", [id]);
  },

  async findMany(filters = {}) {
    let query = "SELECT * FROM subscriptions WHERE 1=1";
    const values = [];
    let paramIndex = 1;

    if (filters.userId) {
      query += ` AND user_id = $${paramIndex}`;
      values.push(filters.userId);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }

    if (filters.startDate && filters.endDate) {
      query += ` AND renewal_date >= $${paramIndex} AND renewal_date <= $${paramIndex + 1}`;
      values.push(filters.startDate, filters.endDate);
      paramIndex += 2;
    }

    const result = await pool.query(query, values);

    // Convert snake_case to camelCase for frontend compatibility
    return result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      price: row.price,
      currency: row.currency,
      frequency: row.frequency,
      category: row.category,
      icon: row.icon,
      renewalDate: row.renewal_date,
      startDate: row.start_date,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },
};
