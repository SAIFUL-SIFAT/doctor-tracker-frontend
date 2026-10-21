# Doctor Tracker — Frontend Client

Next.js web application for the Doctor Tracker system built with React, TypeScript, Tailwind CSS, and shadcn/ui.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Radix UI / shadcn/ui
- **State & Data Fetching**: TanStack React Query & Axios
- **Form Management**: React Hook Form & Zod

## Getting Started

### 1. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Ensure your `.env.local` contains:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

### 4. Build for Production
```bash
npm run build
npm start
```
