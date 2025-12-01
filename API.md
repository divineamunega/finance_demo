# API Documentation

This document describes all available API endpoints for the finance demo application.

## Base URL

```
http://localhost:3000/api
```

## Authentication

⚠️ **No authentication required** - These are demo APIs for development purposes only.

## Endpoints

### 1. Demo Users

#### GET `/api/demo-users`

Returns all demo users available in the system.

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Sarah Johnson",
      "email": "sarah.johnson@demo.com",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3000/api/demo-users
```

---

### 2. Accounts

#### GET `/api/accounts`

Returns all accounts for a specific user.

**Query Parameters:**
- `user_id` (required) - UUID of the user

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Checking Account",
      "type": "checking",
      "balance": "2543.50",
      "currency": "USD",
      "createdAt": "2024-05-28T12:00:00.000Z"
    }
  ]
}
```

**Example:**
```bash
curl "http://localhost:3000/api/accounts?user_id=<uuid>"
```

**Error Responses:**
- `400` - Missing user_id parameter
- `500` - Server error

---

### 3. Transactions

#### GET `/api/transactions`

Returns paginated transactions for a specific account.

**Query Parameters:**
- `account_id` (required) - UUID of the account
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 50, max: 100) - Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "accountId": "uuid",
      "date": "2024-11-28T10:30:00.000Z",
      "amount": "-45.67",
      "merchant": "Whole Foods",
      "category": "groceries",
      "balanceAfter": "2497.83",
      "isAnomaly": false,
      "description": null,
      "createdAt": "2024-11-28T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 543,
    "totalPages": 11
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/api/transactions?account_id=<uuid>&page=1&limit=10"
```

**Error Responses:**
- `400` - Missing account_id or invalid pagination parameters
- `500` - Server error

---

### 4. Simulate Daily Update

#### POST `/api/simulate-daily-update`

Generates new transactions for all accounts and updates balances. Simulates daily financial activity.

**Query Parameters:** None

**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Daily update completed successfully",
  "data": {
    "accountsUpdated": 8,
    "transactionsCreated": 15
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/simulate-daily-update
```

**Details:**
- Generates 1-3 transactions per account
- Updates account balances automatically
- Uses realistic transaction patterns based on account type
- 5% chance of anomaly flag

**Error Responses:**
- `500` - Server error

---

### 5. Analyze

#### POST `/api/analyze`

Performs comprehensive AI-powered financial analysis for a user.

**Query Parameters:**
- `user_id` (required) - UUID of the user

**Request Body:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "period": {
      "start": "2024-05-28T12:00:00.000Z",
      "end": "2024-11-28T12:00:00.000Z"
    },
    "totals": {
      "income": 45000.00,
      "expenses": 32500.50,
      "netChange": 12499.50
    },
    "monthlyBreakdown": [
      {
        "month": "2024-11",
        "income": 7500.00,
        "expenses": 5400.25
      }
    ],
    "categoryBreakdown": [
      {
        "category": "groceries",
        "total": 4500.00
      }
    ],
    "anomalies": [
      {
        "merchant": "Luxury Store",
        "amount": 1200.00,
        "date": "2024-11-15T14:30:00.000Z",
        "reason": "3.2x higher than average shopping transaction"
      }
    ],
    "insights": "AI-generated natural language summary...",
    "topCategory": "groceries",
    "summaryId": "uuid"
  }
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/analyze?user_id=<uuid>"
```

**Analysis Features:**
1. **Monthly Aggregation** - Income and expenses per month
2. **Category Aggregation** - Total spending per category
3. **Anomaly Detection** - Transactions >2.5x category average
4. **AI Summary** - Natural language insights via OpenAI
5. **Database Storage** - Saves summary for future reference

**Requirements:**
- OpenAI API key must be set in `.env.local` as `OPENAI_API_KEY`

**Error Responses:**
- `400` - Missing user_id parameter
- `404` - No accounts or transactions found
- `500` - Server error or OpenAI API error

---

### 6. Todos

#### GET `/api/todos`

Returns all todos for a specific account.

**Query Parameters:**
- `account_id` (required) - UUID of the account

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "accountId": "uuid",
      "title": "Review monthly expenses",
      "description": "Check for unusual spending patterns",
      "dueDate": "2024-12-01T00:00:00.000Z",
      "isCompleted": false,
      "priority": "high",
      "createdAt": "2024-11-28T12:00:00.000Z",
      "completedAt": null
    }
  ]
}
```

**Example:**
```bash
curl "http://localhost:3000/api/todos?account_id=<uuid>"
```

---

#### POST `/api/todos`

Creates a new todo.

**Query Parameters:** None

**Request Body:**
```json
{
  "accountId": "uuid",
  "title": "Review monthly expenses",
  "description": "Check for unusual spending patterns",
  "dueDate": "2024-12-01",
  "priority": "high"
}
```

**Required Fields:**
- `accountId` - UUID of the account
- `title` - Todo title

**Optional Fields:**
- `description` - Todo description
- `dueDate` - Due date (ISO 8601 format)
- `priority` - Priority level: `low`, `medium`, or `high` (default: `medium`)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "accountId": "uuid",
    "title": "Review monthly expenses",
    "description": "Check for unusual spending patterns",
    "dueDate": "2024-12-01T00:00:00.000Z",
    "isCompleted": false,
    "priority": "high",
    "createdAt": "2024-11-28T12:00:00.000Z",
    "completedAt": null
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "<uuid>",
    "title": "Review monthly expenses",
    "priority": "high"
  }'
```

---

#### PATCH `/api/todos`

Updates an existing todo.

**Query Parameters:**
- `id` (required) - UUID of the todo

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "dueDate": "2024-12-15",
  "isCompleted": true,
  "priority": "medium"
}
```

**All fields are optional** - only include fields you want to update.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "accountId": "uuid",
    "title": "Updated title",
    "description": "Updated description",
    "dueDate": "2024-12-15T00:00:00.000Z",
    "isCompleted": true,
    "priority": "medium",
    "createdAt": "2024-11-28T12:00:00.000Z",
    "completedAt": "2024-11-28T14:30:00.000Z"
  }
}
```

**Example:**
```bash
curl -X PATCH "http://localhost:3000/api/todos?id=<uuid>" \
  -H "Content-Type: application/json" \
  -d '{"isCompleted": true}'
```

**Note:** When marking a todo as completed (`isCompleted: true`), the `completedAt` timestamp is automatically set.

---

#### DELETE `/api/todos`

Deletes a todo.

**Query Parameters:**
- `id` (required) - UUID of the todo

**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Todo deleted successfully",
  "data": {
    "id": "uuid",
    "accountId": "uuid",
    "title": "Review monthly expenses",
    ...
  }
}
```

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/todos?id=<uuid>"
```

---

---

### 7. Chat

#### POST `/api/chat`

Intelligent chat endpoint with OpenAI integration and financial context.

**Query Parameters:** None

**Request Body:**
```json
{
  "user_id": "uuid",
  "session_id": "uuid (optional)",
  "messages": [
    {
      "role": "user",
      "content": "How much did I spend on groceries this month?"
    }
  ]
}
```

**Required Fields:**
- `user_id` - UUID of the user
- `messages` - Array of message objects with `role` and `content`

**Optional Fields:**
- `session_id` - UUID of existing chat session (creates new if not provided)

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "message": {
      "id": "uuid",
      "role": "assistant",
      "content": "Based on your recent transactions, you spent $450.25 on groceries this month...",
      "createdAt": "2024-11-28T13:00:00.000Z"
    },
    "context_used": {
      "accounts_count": 3,
      "recent_transactions_count": 45,
      "has_summary": true
    }
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "<uuid>",
    "messages": [
      {
        "role": "user",
        "content": "What are my top spending categories?"
      }
    ]
  }'
```

**Features:**
1. **Conversation Storage** - Stores all messages in database
2. **Session Management** - Creates/updates chat sessions
3. **Financial Context** - Pulls user accounts, recent transactions, and summaries
4. **AI-Powered Responses** - Uses OpenAI GPT-4o-mini for intelligent replies
5. **Context Awareness** - Includes financial data in AI prompts

**Context Provided to AI:**
- User's account balances and types
- Recent transactions (last 30 days)
- Top spending categories
- Latest financial insights/summaries

**Response Time:** 2-5 seconds (OpenAI API latency)

---

#### GET `/api/chat`

Retrieves chat history.

**Query Parameters:**
- `session_id` (optional) - Get messages for specific session
- `user_id` (optional) - Get all sessions for user

**Response (with session_id):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "uuid",
      "userId": "uuid",
      "title": "How much did I spend...",
      "createdAt": "2024-11-28T12:00:00.000Z",
      "updatedAt": "2024-11-28T13:00:00.000Z"
    },
    "messages": [
      {
        "id": "uuid",
        "sessionId": "uuid",
        "role": "user",
        "content": "How much did I spend on groceries?",
        "createdAt": "2024-11-28T12:00:00.000Z"
      },
      {
        "id": "uuid",
        "sessionId": "uuid",
        "role": "assistant",
        "content": "You spent $450.25 on groceries...",
        "createdAt": "2024-11-28T12:00:05.000Z"
      }
    ]
  }
}
```

**Response (with user_id):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "How much did I spend...",
      "createdAt": "2024-11-28T12:00:00.000Z",
      "updatedAt": "2024-11-28T13:00:00.000Z"
    }
  ]
}
```

**Example:**
```bash
# Get session messages
curl "http://localhost:3000/api/chat?session_id=<uuid>"

# Get user's sessions
curl "http://localhost:3000/api/chat?user_id=<uuid>"
```

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (POST requests)
- `400` - Bad Request (missing or invalid parameters)
- `404` - Not Found
- `500` - Internal Server Error

---

## Environment Variables

Add these to your `.env.local` file:

```bash
# Database connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance_demo

# OpenAI API key (required for /api/analyze endpoint)
OPENAI_API_KEY=sk-...
```

---

## Usage Flow

### Typical User Flow:

1. **Get Demo Users**
   ```bash
   GET /api/demo-users
   ```

2. **Select a User and Get Their Accounts**
   ```bash
   GET /api/accounts?user_id=<uuid>
   ```

3. **View Transactions for an Account**
   ```bash
   GET /api/transactions?account_id=<uuid>&page=1&limit=50
   ```

4. **Run Financial Analysis**
   ```bash
   POST /api/analyze?user_id=<uuid>
   ```

5. **Manage Todos**
   ```bash
   GET /api/todos?account_id=<uuid>
   POST /api/todos (with body)
   PATCH /api/todos?id=<uuid> (with body)
   DELETE /api/todos?id=<uuid>
   ```

6. **Simulate Daily Activity**
   ```bash
   POST /api/simulate-daily-update
   ```

---

## Testing

You can test all endpoints using curl, Postman, or directly in your Next.js application.

### Quick Test Script:

```bash
# 1. Get demo users
curl http://localhost:3000/api/demo-users

# 2. Get accounts (replace <user_id> with actual UUID from step 1)
curl "http://localhost:3000/api/accounts?user_id=<user_id>"

# 3. Get transactions (replace <account_id> with actual UUID from step 2)
curl "http://localhost:3000/api/transactions?account_id=<account_id>&limit=10"

# 4. Simulate daily update
curl -X POST http://localhost:3000/api/simulate-daily-update

# 5. Run analysis (requires OPENAI_API_KEY)
curl -X POST "http://localhost:3000/api/analyze?user_id=<user_id>"
```

---

## Notes

- All UUIDs are generated using PostgreSQL's `gen_random_uuid()`
- Timestamps are in ISO 8601 format
- Monetary amounts are stored as strings with 2 decimal places
- The `/api/analyze` endpoint may take 5-10 seconds due to OpenAI API calls
- Transaction pagination defaults to 50 items per page for performance
