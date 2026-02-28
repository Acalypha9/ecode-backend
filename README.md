# E-CODE Task Manager Backend

This is the backend REST API for the Simple Personal Task Manager application, built as part of the E-CODE HIMIT PENS Backend Developer recruitment challenge.

## Features
- **User Authentication**: Secure signup and login using JSON Web Tokens (JWT).
- **Task Management**: Full CRUD operations for tasks.
  - Set priorities (`LOW`, `MEDIUM`, `HIGH`) and statuses (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
  - Add optional due dates to tasks.
- **Profile Management**: Update user profile information (name) and change passwords.
- **Filtering & Sorting**: Advanced querying to filter tasks by status or priority, and sort by dates or alphabetical order.

## Tech Stack
- **Framework**: Express.js (v5) with Node.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma (v6)
- **Authentication**: JWT & bcryptjs for password hashing
- **Validation**: Joi (Request validation schemas)

## Prerequisites
- Node.js (v18 or newer recommended)
- PostgreSQL (running locally or a remote connection string)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Acalypha9/ecode-backend.git
   cd ecode-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add the following variables:
   ```env
   # Server Port
   PORT=4000

   # PostgreSQL Database Connection
   DATABASE_URL="postgresql://username:password@localhost:5432/task_manager?schema=public"

   # JWT Secrets
   JWT_SECRET="your_super_secret_jwt_key_here"
   JWT_EXPIRES_IN="1d"
   ```

4. **Set up the Database**
   Run the Prisma migrations to set up your database schema:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The server will start at `http://localhost:4000`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive a JWT

### Profile
- `GET /api/profile` - Get current user profile (requires auth)
- `PUT /api/profile` - Update user name (requires auth)
- `PUT /api/profile/password` - Change user password (requires auth)

### Tasks (Requires Auth)
- `GET /api/tasks` - Get all tasks for the logged-in user
  - Query Params: `status`, `priority`, `search`, `sortBy`, `sortOrder`
- `GET /api/tasks/:id` - Get a specific task by ID
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update an existing task
- `DELETE /api/tasks/:id` - Delete a task

## Scripts
- `npm run dev`: Starts the development server using `tsx`.
- `npm run build`: Compiles the TypeScript code to standard JavaScript in the `dist` directory.
- `npm start`: Runs the compiled JavaScript from the `dist` directory (must run `build` first).
