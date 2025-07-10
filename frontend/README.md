# Social Media Automation Tool - Frontend

A modern, responsive web application built with React, Vite, and Tailwind CSS for managing and automating social media posts.

## Features

- 📝 Document management for content creation
- 🐦 Tweet scheduling and management
- 📊 Analytics and performance tracking
- 🎨 Clean, modern UI with dark mode support
- 🚀 Fast and responsive design

## Prerequisites

- Node.js 16+ and npm 8+

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social_media_automation_tool/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## Tech Stack

- ⚛️ React 18
- 🚀 Vite 4
- 🎨 Tailwind CSS 3
- 🔄 React Router 6
- ✨ Hero Icons

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  │   ├── Dashboard.jsx
  │   ├── Documents.jsx
  │   ├── Tweets.jsx
  │   └── Stats.jsx
  ├── App.jsx        # Main application component
  └── main.jsx       # Application entry point
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.
