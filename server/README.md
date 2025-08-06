# Express.js Backend with TypeScript

This is the backend server for the nextjs-singleaudio2 project. It's built with Express.js, TypeScript, and MongoDB.

## Project Structure

```
server/
├── dist/                # Compiled JavaScript files
├── src/                 # TypeScript source files
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Example environment variables
├── .eslintrc.json       # ESLint configuration
├── nodemon.json         # Nodemon configuration
├── package.json         # Dependencies and scripts
├── README.md            # This file
└── tsconfig.json        # TypeScript configuration
```

## Getting Started

1. Create a `.env` file based on `.env.example` and update the MongoDB URI.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start the development server with Nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

## Deployment

This server is designed to be deployed separately from the frontend. It can be deployed to services like Render, Heroku, or any other Node.js hosting service.

### Deploying to Render:

1. Create a new Web Service in Render
2. Connect your repository
3. Set the following:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
4. Add your environment variables
5. Deploy 