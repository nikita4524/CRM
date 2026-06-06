# Lead Management CRM

A full-stack Lead Management CRM built with Next.js, Node.js + Express, and MongoDB.

## Features

- **Add / Edit / Delete leads** — full CRUD via modals, no page reloads
- **Lead statuses** — New, Contacted, Qualified, Converted, Lost with color-coded badges
- **Search** — debounced real-time search across name, email, and company
- **Filter** — by lead status via dropdown
- **Sort** — click any column header to sort asc/desc
- **Pagination** — configurable page size, smart page number display
- **Statistics dashboard** — total leads, breakdown by status, conversion rate
- **Responsive design** — mobile-friendly layout using Tailwind CSS

## Tech Stack

| Layer    | Technology                         |
|----------|------------------------------------|
| Frontend | Next.js 15 (Pages Router), React 19, Tailwind CSS |
| Backend  | Node.js, Express.js                |
| Database | MongoDB with Mongoose              |
| HTTP     | Axios                              |
| Icons    | Lucide React                       |
| Toasts   | react-hot-toast                    |

---

## Project Structure

```
lead-crm/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── leadController.js   # CRUD + stats logic
│   │   ├── models/
│   │   │   └── Lead.js             # Mongoose schema
│   │   ├── routes/
│   │   │   └── leads.js            # Express router
│   │   └── server.js               # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ConfirmDialog.jsx    # Delete confirmation modal
    │   │   ├── LeadForm.jsx         # Create/edit form
    │   │   ├── LeadTable.jsx        # Sortable data table
    │   │   ├── Modal.jsx            # Reusable modal wrapper
    │   │   ├── Pagination.jsx       # Pagination controls
    │   │   ├── StatsCard.jsx        # Stat metric card
    │   │   └── StatusBadge.jsx      # Colored status pill
    │   ├── lib/
    │   │   ├── api.js               # Axios API client
    │   │   └── constants.js         # Statuses, colors
    │   ├── pages/
    │   │   ├── _app.js
    │   │   └── index.js             # Main dashboard
    │   └── styles/
    │       └── globals.css
    ├── jsconfig.json
    ├── next.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Setup Instructions

### Prerequisites

- Node.js >= 18
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Clone the repo

```bash
git clone <repo-url>
cd lead-crm
```

### 2. Backend

```bash
cd backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# Edit .env and set your MONGODB_URI

# Start development server (requires nodemon)
npm run dev

# Or start production server
npm start
```

The API will be available at `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create your .env.local file
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL if your backend is not on port 5000

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## API Reference

### Base URL: `/api`

| Method | Endpoint          | Description                              |
|--------|-------------------|------------------------------------------|
| GET    | `/leads`          | Get all leads (search, filter, sort, page) |
| POST   | `/leads`          | Create a new lead                        |
| GET    | `/leads/stats`    | Get lead statistics                      |
| GET    | `/leads/:id`      | Get a single lead                        |
| PUT    | `/leads/:id`      | Update a lead                            |
| DELETE | `/leads/:id`      | Delete a lead                            |

### Query Parameters for `GET /leads`

| Param      | Type   | Default     | Description                          |
|------------|--------|-------------|--------------------------------------|
| search     | string | `""`        | Search across name, email, company   |
| status     | string | `""`        | Filter by status                     |
| sortBy     | string | `createdAt` | Sort field                           |
| sortOrder  | string | `desc`      | `asc` or `desc`                      |
| page       | number | `1`         | Page number                          |
| limit      | number | `10`        | Items per page (max 100)             |

### Lead Object

```json
{
  "_id": "string",
  "name": "Jane Smith",
  "email": "jane@company.com",
  "phone": "+1 (555) 123-4567",
  "company": "Acme Inc.",
  "status": "New | Contacted | Qualified | Converted | Lost",
  "notes": "Met at conference",
  "createdAt": "2026-06-07T10:00:00.000Z",
  "updatedAt": "2026-06-07T10:00:00.000Z"
}
```

---

## Environment Variables

### Backend (`backend/.env`)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lead-crm
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Deployment

### Backend (Railway / Render / Fly.io)

1. Set `MONGODB_URI` to a MongoDB Atlas connection string
2. Set `FRONTEND_URL` to your deployed frontend URL
3. Deploy the `backend/` folder

### Frontend (Vercel)

1. Import the `frontend/` folder on [vercel.com](https://vercel.com)
2. Set `NEXT_PUBLIC_API_URL` environment variable to your deployed backend URL
3. Deploy
