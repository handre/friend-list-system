# Friends List System

This project is a full-stack application for managing a friends list system. It consists of a React frontend and a Cloudflare Workers backend using Hono as the web framework, with Neon Postgres as the database.

## Prerequisites

- Node.js (v20 or later)
- npm (v10 or later)
- Cloudflare account (for deploying the backend)
- Neon Postgres database


## Getting Started

Clone the repository and navigate to the project root:

bash
git clone <repository-url>
cd <project-directory>


### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   - Copy the `.dev.vars.example` file to `.dev.vars` (same with `test.vars.example`)
   - Fill in the necessary environment variables, including your database connection string

4. Run database migrations:
   ```bash
   npm run migrate
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```

   The backend will be available at `http://localhost:8787`

6. To run backend tests:
   ```bash
   npm test
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

4. To run frontend tests:
   ```bash
   npm test
   ```

## Project Structure

- `backend/`: Contains the Cloudflare Workers backend code
  - `src/`: Source code for the backend
  - `tests/`: Backend tests
- `frontend/`: Contains the React frontend code
  - `src/`: Source code for the frontend
  - `public/`: Public assets for the frontend

## Available Scripts

In the backend directory:
- `npm run dev`: Starts the backend development server
- `npm test`: Runs backend tests
- `npm run migrate`: Runs database migrations
- `npm run deploy`: Deploys the backend to Cloudflare Workers (requires Cloudflare setup)

In the frontend directory:
- `npm start`: Starts the frontend development server
- `npm test`: Runs frontend tests
- `npm run build`: Builds the frontend for production
