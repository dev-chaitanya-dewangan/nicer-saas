# Overview

Nicer SaaS is a production-ready SaaS platform that transforms natural language descriptions into fully designed, functional Notion workspaces using AI. The application allows users to describe their desired workspace through a conversational chat interface and generates sophisticated Notion dashboards with advanced features like formulas, rollups, relations, and multiple view types. The platform includes subscription management with Stripe, template libraries, and enterprise-grade workspace generation capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Authentication**: Integrated with Replit Auth for OAuth-based user authentication
- **UI Components**: Radix UI primitives with custom styling via Tailwind CSS

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handlers
- **Authentication**: Replit Auth integration with session-based authentication
- **Request Handling**: Express middleware for logging, JSON parsing, and error handling

## Data Storage
- **Database**: PostgreSQL using Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Shared schema definitions between client and server
- **Session Storage**: PostgreSQL-based session store for authentication
- **Migrations**: Drizzle Kit for database schema management

## AI Integration
- **AI Provider**: Google Gemini AI for workspace generation
- **Workspace Generation**: Structured prompts to generate complex Notion workspace specifications
- **Chat Interface**: Conversational AI for iterative workspace refinement
- **Template System**: Pre-built templates for common use cases

## External Service Integrations
- **Notion API**: Direct integration for workspace deployment to user accounts
- **OAuth Authentication**: Notion OAuth for secure account connection
- **Stripe Payments**: Subscription management and billing
- **Replit Connectors**: Managed OAuth connections for external services

## Payment and Subscription System
- **Payment Processor**: Stripe with React Stripe.js integration
- **Subscription Tiers**: Free, Pro, and Enterprise plans with usage-based quotas
- **Usage Tracking**: Monthly workspace generation limits with automatic resets
- **Billing Management**: Customer portal integration for subscription management

## Security and Authentication
- **User Management**: Replit Auth with support for Google, GitHub, and email authentication
- **Session Management**: Secure session storage with PostgreSQL backend
- **API Security**: Middleware-based authentication checks for protected routes
- **Environment Variables**: Secure configuration management for API keys and secrets

## Development and Deployment
- **Build System**: Vite for frontend bundling, esbuild for server compilation
- **Development Environment**: Hot module replacement with Vite dev server
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared code
- **Code Organization**: Monorepo structure with shared schemas and utilities

# External Dependencies

## Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit Auth service for user management
- **Hosting**: Replit platform with integrated deployment

## AI and Content Generation
- **Google Gemini**: AI model for natural language processing and workspace generation
- **Notion API**: Workspace deployment and integration services

## Payment Processing
- **Stripe**: Payment processing, subscription management, and billing
- **Stripe Webhooks**: Real-time subscription status updates

## Development Tools
- **Vite**: Frontend build tool and development server
- **Drizzle**: Database ORM and migration tool
- **TanStack Query**: Server state management and caching
- **Radix UI**: Accessible component primitives

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library for consistent iconography