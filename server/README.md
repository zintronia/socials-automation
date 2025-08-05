# Social Media Automation Backend

This is the backend server for the Social Media Automation Platform. It is built with Node.js, TypeScript, Express, and PostgreSQL, and integrates with OpenAI for AI-powered content generation.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your environment variables.
3. Run database migrations and seed data.
4. Build the project:
   ```bash
   npm run build
   ```
5. Start the server:
   ```bash
   npm start
   ```

## Development

- Use `npm run dev` for development with hot-reloading.
- Use `npm run test` to run tests.

## Features
- User authentication (JWT)
- Context and template management
- AI-powered post generation
- Platform-specific content optimization
- Scheduling and analytics 