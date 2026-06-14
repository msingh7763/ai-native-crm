<<<<<<< HEAD
# Xeno CRM Platform

This project is a Customer Relationship Management (CRM) and Marketing platform designed to manage customers, orders, campaigns, segments, and analytics. It simulates a realistic marketing flow including message delivery and status tracking.

## Project Architecture

The project is split into three main components:

1. **Client (`/client`)**
   - **Stack:** React, Vite, Tailwind CSS
   - **Purpose:** The frontend dashboard for the platform. It allows users to interact with the CRM, view analytics, manage campaigns, and configure segments.

2. **Server (`/server`)**
   - **Stack:** Node.js, Express, MongoDB (Mongoose), Google Generative AI
   - **Purpose:** The main backend REST API. It handles business logic, database operations, and integrates with AI features. It exposes routes for:
     - `/api/customers`
     - `/api/orders`
     - `/api/campaigns`
     - `/api/segments`
     - `/api/analytics`
     - `/api/webhook` (to receive message delivery statuses)

3. **Channel Service (`/channel-service`)**
   - **Stack:** Node.js, Express
   - **Purpose:** A mock delivery service simulator. When a campaign is sent, this service pretends to send the message through a specified channel. It waits for 2-5 seconds and then triggers a webhook back to the Main Server (`/api/webhook/receipt`) with a randomly generated delivery status (`Failed`, `Delivered`, `Opened`, or `Clicked`).

## Prerequisites

- Node.js (v18+)
- MongoDB (Running locally or a MongoDB Atlas URI)
- `.env` files properly configured in both `/server` and `/channel-service` (with DB connection strings, Webhook URLs, and API keys).

## How to Run

To run the full application, you need to start all three services concurrently in separate terminal windows.

### 1. Start the Server

```bash
cd server
npm install
npx nodemon src/index.js
```

_Runs on port 5000 by default._

### 2. Start the Channel Service

```bash
cd channel-service
npm install
npx nodemon index.js
```

_Runs on port 5001 by default._

### 3. Start the Client

```bash
cd client
npm install
npm run dev
```

_Runs on port 5173 by default (Vite standard)._

## Features

- **Campaign Management:** Create and track marketing campaigns.
- **Segmentation:** Filter customers based on various criteria.
- **Analytics:** View detailed metrics on campaign performance and delivery statuses.
- **Webhook Integration:** Asynchronous tracking of message states (Delivered, Opened, etc.).

## End-to-End Workflow

The typical lifecycle of a campaign within the Xeno CRM platform follows these steps:

1. **Data Generation / Ingestion:**
   - Customers and their historic order data are inserted into the system (e.g., via the demo data generator). This populates the database with realistic metrics like `totalSpent` and `lastOrderDate`.

2. **Audience Segmentation:**
   - The user inputs a natural language prompt (e.g., "Customers who spent more than $5000") in the Audience Builder.
   - The Server leverages Google Generative AI to translate this prompt into a valid MongoDB query and retrieves the matching customer segment.

3. **Campaign Creation:**
   - The user inputs a campaign goal (e.g., "Winback high spenders with a 20% discount") in the Campaign Builder.
   - The Server utilizes AI to generate personalized content including a subject line, message body, and a recommended channel (Email, SMS, WhatsApp, etc.).

4. **Campaign Launch:**
   - The user reviews and launches the campaign. The Server iterates over the targeted audience segment and generates a `CommunicationLog` (status: `Pending`) for each customer.
   - The Server dispatches a request for each customer to the **Channel Service**.

5. **Message Delivery Simulation (Channel Service):**
   - The Channel Service receives the request and simulates real-world delivery latency by waiting 2-5 seconds.
   - It probabilistically determines a final delivery status (`Delivered`, `Opened`, `Clicked`, or `Failed`).

6. **Webhook Receipt & Analytics:**
   - The Channel Service fires a webhook back to the Server's `/api/webhook/receipt` endpoint with the determined status.
   - The Server updates the `CommunicationLog` for each customer.
   - The user views the Analytics Dashboard, which reflects the real-time aggregated metrics (Delivery Rate, Open Rate, Click Rate) of the campaign.
=======
# AI-native-CRM
>>>>>>> 027bffe0226a8ddbe7e7658ae7dce79458f28f45
