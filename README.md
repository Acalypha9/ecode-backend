# E-CODE Task Manager Backend

This is the backend REST API for the Simple Personal Task Manager application, built as part of the E-CODE HIMIT PENS Backend Developer recruitment challenge.


## Live Demo

The API is deployed and fully integrated with a Next.js frontend application.
- **Web Application**: [https://task.acalypha.my.id/](https://task.acalypha.my.id/)
- **Live API Base URL**: `https://api.acalypha.my.id`
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

---

## Detailed API Documentation

All successful responses follow this format:
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": { ... }
}
```

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error message description"
}
```

### Authentication

#### `POST /api/auth/register`
Create a new user account.
- **Body**
  - `name` (string, required): Minimum 2 characters.
  - `email` (string, required): Valid email address.
  - `password` (string, required): Minimum 6 characters.
- **Success**: 201 Created. Returns user object and JWT token.

#### `POST /api/auth/login`
Login and receive a JWT.
- **Body**
  - `email` (string, required)
  - `password` (string, required)
- **Success**: 200 OK. Returns user object and JWT token.

### Tasks
*Note: All endpoints require `Authorization: Bearer <token>` header.*

#### `GET /api/tasks`
Get paginated tasks belonging to the current user.
- **Query Parameters**:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 10)
  - `status` (string): Filter by `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
  - `priority` (string): Filter by `LOW`, `MEDIUM`, `HIGH`
  - `search` (string): Search in title or description
  - `sortBy` (string): Field to sort by (default: `createdAt`)
  - `sortOrder` (string): `asc` or `desc` (default: `desc`)
- **Success**: 200 OK. Returns array of tasks and pagination metadata.

#### `GET /api/tasks/:id`
Get details of a specific task.
- **Params**: `id` (UUID of the task)
- **Success**: 200 OK. Returns task object.
- **Error**: 404 Not Found if task doesn't exist or belongs to another user.

#### `POST /api/tasks`
Create a new task.
- **Body**
  - `title` (string, required): Minimum 3 characters.
  - `description` (string, optional)
  - `priority` (string, optional): `LOW`, `MEDIUM`, `HIGH` (default: `MEDIUM`)
  - `dueDate` (ISO 8601 Date String, optional)
- **Success**: 201 Created. Returns the created task.

#### `PUT /api/tasks/:id`
Update an existing task.
- **Params**: `id` (UUID of the task)
- **Body** (all optional):
  - `title` (string)
  - `description` (string)
  - `status` (string): `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
  - `priority` (string): `LOW`, `MEDIUM`, `HIGH`
  - `dueDate` (ISO 8601 Date String)
- **Success**: 200 OK. Returns the updated task.

#### `DELETE /api/tasks/:id`
Delete a task.
- **Params**: `id` (UUID of the task)
- **Success**: 200 OK. Returns deletion confirmation.

### Profile
*Note: All endpoints require `Authorization: Bearer <token>` header.*

#### `GET /api/profile`
Get current user profile information.
- **Success**: 200 OK. Returns user details.

#### `PUT /api/profile`
Update user name and/or password.
- **Body**:
  - `name` (string, optional): Minimum 2 characters.
  - `currentPassword` (string, required if changing password)
  - `newPassword` (string, required if changing password): Minimum 6 characters.
- **Success**: 200 OK. Returns updated user profile.

## Scripts
- `npm run dev`: Starts the development server using `tsx`.
- `npm run build`: Compiles the TypeScript code to standard JavaScript in the `dist` directory.
- `npm start`: Runs the compiled JavaScript from the `dist` directory (must run `build` first).

## Testing with Postman

### 1. Health Check
- **GET** `http://localhost:4000/health`

### 2. Register
- **POST** `http://localhost:4000/api/auth/register`
- Body → raw → JSON:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2026-02-28T00:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
  ```

### 3. Login
- **POST** `http://localhost:4000/api/auth/login`
- Body → raw → JSON:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- Copy the `token` from the response for authenticated requests.

### 4. Authenticated Requests

After login, set the token in Postman:
1. Go to the **Authorization** tab
2. Type: **Bearer Token**
3. Paste the token you copied

#### Get All Tasks
- **GET** `http://localhost:4000/api/tasks`
- Query Params (optional): `status`, `priority`, `search`, `sortBy`, `sortOrder`, `page`, `limit`
- Example: `http://localhost:4000/api/tasks?status=PENDING&priority=HIGH&search=belajar&sortBy=createdAt&sortOrder=desc&page=1&limit=10`

#### Get Task by ID
- **GET** `http://localhost:4000/api/tasks/:id`

#### Create Task
- **POST** `http://localhost:4000/api/tasks`
- Body → raw → JSON:
  ```json
  {
    "title": "Belajar Express",
    "description": "Pelajari Express 5 dan TypeScript",
    "priority": "HIGH",
    "dueDate": "2026-03-15T00:00:00.000Z"
  }
  ```

#### Update Task
- **PUT** `http://localhost:4000/api/tasks/:id`
- Body → raw → JSON:
  ```json
  {
    "title": "Updated Task",
    "status": "COMPLETED"
  }
  ```

#### Delete Task
- **DELETE** `http://localhost:4000/api/tasks/:id`

#### Get Profile
- **GET** `http://localhost:4000/api/profile`

#### Update Profile
- **PUT** `http://localhost:4000/api/profile`
- Body → raw → JSON:
  ```json
  {
    "name": "Jane Doe",
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }
  ```
