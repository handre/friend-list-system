# Friends List System

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
3. [Project Structure](#project-structure)
4. [Available Scripts](#available-scripts)
5. [Covered Scope](#covered-scope)
6. [Assumptions](#assumptions)
7. [Todo - Product](#todo---product)
   1. [Product Strategy](#1-product-strategy)
   2. [Market Research](#2-market-research)
   3. [Growth Points](#3-growth-points)
   4. [Negative Roadmap](#4-negative-roadmap)
   5. [Features](#5-features)
8. [Todo - Development](#todo---development)

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


## Covered Scope

1. Backend Endpoints / Restful API
2. Using Hono / Cloudflare Workers / Neon
3. A way to track friends
4. Upload to GitHub
5. (bonus) Home page in React to show statistics
6. (bonus) Pagination
7. (bonus) Input validation using zod
8. (bonus) Integration tests for the API
9. (bonus) Deployed to Cloudflare
10. (bonus - Andre) React app to create and connect Users
11. (bonus - Andre) Product reasoning

## Assumptions

1. 1-way friend connections because this App could work as a supercharged contact list
2. Frontend app was built from an Admin's perspective (i.e. not real User) to save development time
3. No need to actually access the app in Cloudflare, all the development was local only

## Todo - Product

### 1. Product Strategy

#### Value Proposition
- A contact list on steroids, where you can multi-connect with your friends through all your shared social networks so you never lose a contact ever again.
- Find valuable hidden shared connections (e.g. this CEO is uncle of a big friend of mine)
- Find friends through multiple social networks, no more guessing of Instagram's nicknames

#### Risk
- Fediverse could capture some of this market
- Chicken and egg problem might make shared connection discoverability difficult in the beginning

### 2. Market Research
- Validate the pain points / value proposition
- Check for other players that could have some offering in these areas

### 3. Growth Points
- When joining, automatically search for all friends in which you are connected in at least 1 social network and suggest friendship
- Automatically get the top X friends from your contacts and send them an invite to the Friend List System
- Create new User if Friend search doesn't return and send an invite for them to try Friend List System

### 4. Negative Roadmap
- We are not implementing a messaging system any time soon. Other players are doing that quite well and we wouldn't have any significant leverage to offer a better solution.

### 5. Features
- Add mainstream platforms (Facebook, IG, Twitter, LinkedIn, and others) and phone
- Transparent contacts in case of 2-way connection
- Search through multiple social networks
- Pending friend requests
- "Friends since" column
- Picture
- Edit User
- Sorting of users / friends
- Mobile-friendly version

## Todo - Development

1. Shared Types for backend and frontend
2. Error Handling middleware
3. Swifter UX
4. Solve Code Duplication in Frontend (API calls, Pagination Logic, error handling, User list Rendering, etc)
5. Authentication/Authorization
6. Logging / Monitoring
7. Prettier
8. Auto run integration tests on pre-commit
9. Deployment pipeline