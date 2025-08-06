# SoundWave - Music Distribution Platform

A full-stack music distribution platform built with Next.js 14 and Express.js, allowing artists to upload and distribute their music to major streaming platforms while tracking performance and royalties.

## Tech Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Material UI v5
- React Hook Form for form handling
- Recharts for analytics
- JWT authentication via cookies

### Backend
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT authentication
- File uploads with Multer
- Input validation with express-validator

## Project Structure

This is a monorepo containing both frontend and backend:

```
/
├── src/                # Next.js frontend
│   ├── app/            # App Router pages
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── services/       # API service functions
│   └── utils/          # Utility functions and constants
│
├── server/             # Express.js backend
│   ├── src/            # Backend source code
│   ├── uploads/        # Uploaded files (audio, artwork)
│   ├── package.json    # Backend dependencies
│   └── tsconfig.json   # TypeScript configuration
│
├── package.json        # Root dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## Features

### Artist Features
- User authentication (signup, login, profile management)
- Track upload with audio and artwork
- Release management and status tracking
- Royalty tracking and analytics
- Payout requests via PayPal or UPI
- Notification system for release approvals and payouts

### Admin Features
- User management
- Release approval workflow
- Payout processing
- Analytics dashboard

### Public Features
- Public artist profiles
- Music preview
- Artist social links

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/soundwave.git
cd soundwave
```

2. Install dependencies:
```bash
npm install
npm run install:server
```

3. Set up environment variables:
Create a `.env` file in the root directory and in the server directory with the following variables:

```
# In the root .env file
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# In the server/.env file
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
```

4. Start the development servers:
```bash
npm run dev
```

This will start both the Next.js frontend and Express backend concurrently.

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Deployment

### Frontend
The Next.js frontend can be deployed on Vercel:

```bash
npm run build:client
```

### Backend
The Express backend can be deployed on services like Render or Heroku:

```bash
npm run build:server
```

## License

This project is licensed under the MIT License.
