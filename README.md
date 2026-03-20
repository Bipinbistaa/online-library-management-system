# 📚 Online Library Management System

A complete, production-ready full-stack Library Management System built with **MySQL**, **Node.js/Express**, and **React**.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios, React Toastify |
| Backend | Node.js, Express.js, JWT, bcryptjs |
| Database | MySQL 5.7+ (7 normalized tables, views, procedures, triggers) |
| Auth | JWT tokens with role-based access control |

## Features

### User Features
- 🔐 Register & Login with JWT authentication
- 📖 Browse & search books by title, author, category
- 📋 Borrow and return books
- ⭐ Write and read book reviews
- 👤 Manage personal profile

### Admin Features
- 📊 Dashboard with statistics (total books, active borrows, overdue, etc.)
- 📚 Book inventory management (add, edit, delete)
- 👥 User management (activate/deactivate, change roles)
- 📋 Borrow tracking with overdue detection
- 📝 Activity logs

## Database Design (7 Tables - 3NF)

- **users** — User accounts with role-based access (member/admin)
- **authors** — Author profiles
- **categories** — Book categories
- **books** — Book inventory with availability tracking
- **borrows** — Borrowing records with status management
- **reviews** — Book ratings and reviews (1-5 stars)
- **admin_logs** — Admin activity audit trail

### Advanced MySQL Features
- **3 Views**: UserBorrowHistory, AvailableBooks, TopRatedBooks
- **4 Stored Procedures**: BorrowBook, ReturnBook, GetUserBorrowHistory, GetBookStatistics
- **3 Triggers**: Overdue status updates, admin action logging
- **5 Indexes**: Email, ISBN, borrow status, userId, bookId

## Project Structure

```
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers (auth, books, borrows, reviews, users, admin)
│   ├── database/        # SQL files (schema, views, procedures, triggers, sample data)
│   ├── middleware/      # Auth, error handling, validation
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── uploads/         # Book cover images
│   ├── app.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    └── src/
        ├── components/  # Navbar, Footer, Loading, ErrorMessage
        ├── context/     # AuthContext (JWT management)
        ├── pages/       # Home, Login, Register, BookCatalog, BookDetails, MyBorrows, MyProfile
        │   └── admin/   # AdminDashboard, UserManagement, BookManagement, BorrowManagement
        ├── services/    # Axios API client
        └── App.js
```

## Quick Start

### Prerequisites
- Node.js v14+
- MySQL 5.7+
- npm or yarn

### 1. Database Setup

```bash
# Import schema
mysql -u root -p < backend/database/schema.sql

# Import views, procedures, triggers
mysql -u root -p library_db < backend/database/views.sql
mysql -u root -p library_db < backend/database/procedures.sql
mysql -u root -p library_db < backend/database/triggers.sql

# Load sample data
mysql -u root -p library_db < backend/database/sampleData.sql
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials and JWT secret

npm start   # Production
npm run dev # Development with nodemon
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Environment Variables

Create `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=library_db
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Testing Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@library.com | password123 |
| Member | user1@library.com | password123 |
| Member | user2@library.com | password123 |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/profile | Get current user |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/books | List books (search, filter, paginate) |
| GET | /api/books/:id | Get book details |
| POST | /api/books | Add book (Admin) |
| PUT | /api/books/:id | Update book (Admin) |
| DELETE | /api/books/:id | Delete book (Admin) |
| GET | /api/books/categories | List categories |
| GET | /api/books/authors | List authors |

### Borrows
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/borrows | Borrow a book |
| GET | /api/borrows | All borrows (Admin) |
| GET | /api/borrows/user/:userId | User's borrow history |
| PUT | /api/borrows/:id/return | Return a book |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/reviews | Submit review |
| GET | /api/reviews/:bookId | Get book reviews |
| PUT | /api/reviews/:id | Update review |
| DELETE | /api/reviews/:id | Delete review |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Dashboard stats |
| GET | /api/admin/reports/books | Book report |
| GET | /api/admin/reports/users | User report |
| GET | /api/admin/reports/borrows | Borrow report |
| GET | /api/admin/logs | Activity logs |

## Security Features

- JWT authentication with configurable expiry
- Password hashing with bcryptjs (salt rounds: 12)
- Role-based access control (member/admin)
- CORS configuration
- Input validation on all endpoints
- SQL injection prevention via parameterized queries

## License

This project is licensed under the MIT License.