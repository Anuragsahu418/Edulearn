# EduLearn - Educational Platform

## Overview

EduLearn is a comprehensive educational platform built with a full-stack TypeScript architecture. The application provides both admin and student interfaces for managing educational materials, tracking student performance, and delivering course content. It features a modern web interface with real-time data visualization and secure file management capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Shadcn/UI component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom educational theme colors and dark mode support
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **File Handling**: Multer for PDF upload processing with disk storage

### Data Storage
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Connection pooling via @neondatabase/serverless

## Key Components

### Database Schema
The application uses four main entities:
- **Users**: Admin authentication with role-based access
- **Materials**: PDF learning materials with metadata (title, subject, description)
- **Students**: Student records for performance tracking
- **Scores**: Test scores linked to students and subjects
- **System Settings**: Configurable app settings including student access keys

### Authentication System
- **Admin Authentication**: Username/password with bcrypt-style password hashing
- **Student Access**: Secret key-based access for student portal
- **Session Management**: Express sessions with PostgreSQL persistence
- **Route Protection**: Protected routes for admin functionality

### File Management
- **Upload System**: PDF-only uploads with 10MB size limit
- **Storage**: Local file system storage in uploads directory
- **Security**: File type validation and unique filename generation
- **Access Control**: Authenticated access to materials

### Performance Analytics
- **Data Visualization**: Recharts integration for performance charts
- **Metrics**: Score tracking, subject performance, and trend analysis
- **Filtering**: Time-based and subject-based data filtering
- **Real-time Updates**: Query invalidation for live data updates

## Data Flow

### Admin Workflow
1. Admin logs in via username/password authentication
2. Dashboard displays overview metrics and recent activity
3. Material management: Upload PDFs with metadata
4. Student management: Add students and record test scores
5. Performance analytics: View charts and reports

### Student Workflow
1. Student enters secret key for portal access
2. Browse and search available study materials
3. Filter materials by subject or search terms
4. Download PDF materials for offline study

### Data Synchronization
- TanStack Query manages cache invalidation
- Optimistic updates for better user experience
- Real-time refetching on window focus and network reconnection

## External Dependencies

### Core Framework Dependencies
- React ecosystem: react, react-dom, @vitejs/plugin-react
- Routing: wouter for lightweight client-side routing
- State management: @tanstack/react-query for server state

### UI and Styling
- Component library: Complete Radix UI suite for accessible components
- Styling: tailwindcss, autoprefixer, postcss
- Utilities: class-variance-authority, clsx, tailwind-merge

### Backend Infrastructure
- Server: express, passport, passport-local
- Database: drizzle-orm, @neondatabase/serverless
- File handling: multer for uploads
- Session management: express-session, connect-pg-simple

### Development Tools
- TypeScript configuration for full-stack type safety
- ESBuild for server-side bundling
- Vite for client-side development and building
- Replit-specific plugins for development environment

## Deployment Strategy

### Development Environment
- **Local Development**: npm run dev starts both client and server
- **Hot Reloading**: Vite HMR for client, tsx for server auto-restart
- **Environment**: NODE_ENV=development with development-specific features

### Production Build
- **Client Build**: Vite builds optimized static assets to dist/public
- **Server Build**: ESBuild bundles server code to dist/index.js
- **Asset Serving**: Express serves static files in production mode

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16 for full-stack support
- **Ports**: Application runs on port 5000, mapped to external port 80
- **Database**: Automatic PostgreSQL provisioning via DATABASE_URL
- **Deployment**: Autoscale deployment target with build/run commands

### Environment Variables
- **DATABASE_URL**: PostgreSQL connection string (auto-provisioned)
- **SESSION_SECRET**: Required for session security
- **STUDENT_SECRET_KEY**: Optional, defaults to "artlearn2024"

## Changelog

```
Changelog:
- June 19, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```