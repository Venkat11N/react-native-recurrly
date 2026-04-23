# Recurrly Backend API

A simple Node.js/Express backend API for the Recurrly subscription tracking app. Uses JSON file-based storage for simplicity - no database setup required.

## Features

- **Authentication**: Integrated with Clerk for secure user authentication
- **Subscription Management**: Full CRUD operations for subscriptions
- **Insights API**: Endpoints for upcoming subscriptions, monthly history, and weekly chart data
- **User Sync**: Webhook support for syncing users from Clerk
- **Simple Storage**: Uses JSON files for data storage - no database needed

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Copy `.env.example` to `.env` and add your Clerk keys:
```bash
cp .env.example .env
```

3. Add your Clerk credentials to `.env`:
```
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

4. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /health` - Check if API is running

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions for authenticated user
- `GET /api/subscriptions/:id` - Get a single subscription
- `POST /api/subscriptions` - Create a new subscription
- `PUT /api/subscriptions/:id` - Update a subscription
- `DELETE /api/subscriptions/:id` - Delete a subscription

### Insights
- `GET /api/insights/upcoming` - Get upcoming subscriptions (next 7 days)
- `GET /api/insights/history` - Get monthly subscription history
- `GET /api/insights/weekly-chart` - Get weekly chart data

### Users
- `POST /api/users/clerk/webhook` - Clerk webhook for user sync
- `POST /api/users/sync` - Manually sync current user

## Data Storage

Data is stored in JSON files in the `server/data/` directory:
- `users.json` - User data
- `subscriptions.json` - Subscription data

The data directory is automatically created when the server starts.

## Authentication

All endpoints (except health check) require Clerk authentication. The API uses Clerk's backend SDK to verify JWT tokens from the frontend.

## Example Subscription Object

```json
{
  "id": "sub_1234567890",
  "userId": "user_1234567890",
  "name": "Netflix",
  "price": 15.99,
  "currency": "USD",
  "frequency": "Monthly",
  "category": "Entertainment",
  "icon": "netflix",
  "status": "active",
  "renewalDate": "2026-04-25T00:00:00.000Z",
  "startDate": "2026-01-25T00:00:00.000Z",
  "createdAt": "2026-01-25T00:00:00.000Z",
  "updatedAt": "2026-01-25T00:00:00.000Z"
}
```

## Development

- `npm run dev` - Start server with watch mode
- `npm start` - Start server in production mode
