# Overview

This is a Japanese payment application called "マカワンペイ" (Makawan Pay) - a simple payment counter app that allows users to track and process payments. The application features a payment counter that can be incremented (adding payments) and decremented (processing payments), with Google Pay integration for actual payment processing. The interface is bilingual with Japanese text elements and includes audio feedback for user interactions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React SPA**: Built with React 18 using TypeScript and Vite as the build tool
- **UI Framework**: shadcn/ui components with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Express.js Server**: RESTful API server with TypeScript
- **Data Storage**: Dual storage approach - in-memory storage for development with PostgreSQL support via Drizzle ORM
- **API Design**: RESTful endpoints for payment counter operations (`GET`, `POST` for increment/decrement)
- **Middleware**: Express JSON parsing, URL encoding, request logging, and error handling

## Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect for database operations
- **Schema**: Single `payment_counters` table with user ID, counter value, and UUID primary key
- **Development Storage**: In-memory storage class for rapid development and testing
- **Database Provider**: Neon serverless PostgreSQL for production deployment

## Authentication and Authorization
- **Current State**: No authentication system implemented
- **User Identification**: Uses hardcoded "default" user ID for all operations
- **Session Management**: Basic session support scaffolded with connect-pg-simple

## External Dependencies

### Payment Processing
- **Google Pay API**: Integrated for actual payment processing with cryptographic validation
- **Payment Validation**: Zod schemas for payment request validation including signature verification

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle Kit**: Database migration and schema management tool

### UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Google Fonts**: Custom font loading for Inter, Noto Sans JP, and other typefaces
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast build tool with HMR and TypeScript support
- **Replit Integration**: Development environment integration with cartographer and runtime error handling
- **ESBuild**: Fast bundling for production builds

### Audio and Media
- **Web Audio API**: HTML5 audio elements for payment success and interaction sounds
- **Embedded Audio**: Base64-encoded audio assets for jingle playback

The architecture follows a clean separation of concerns with shared TypeScript schemas between frontend and backend, enabling type safety across the full stack. The modular component structure and plugin-based build system allow for easy feature additions and modifications.