# Greenupp - AI-Powered Digital Agriculture Platform

## Overview

Greenupp is a comprehensive Progressive Web Application (PWA) that revolutionizes agriculture through AI-driven technology, blockchain traceability, and comprehensive digital farming solutions. The platform serves as a complete ecosystem for farmers, suppliers, and buyers, providing intelligent digital tools, agricultural intelligence, and advanced social networking capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Radix UI components with Tailwind CSS for styling
- **Styling**: Custom theme system with dark mode support
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **PWA Support**: Full Progressive Web App capabilities with offline support

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for RESTful API
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Real-time Communication**: Multiple WebSocket implementations (Socket.IO, native WebSocket)
- **Authentication**: Passport.js with local strategy and session management
- **File Handling**: Multer for file uploads with local storage

### Key Components

#### Database Layer
- **Primary Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Migrations**: Automated database migrations with Drizzle Kit
- **Connection**: Neon serverless connection with WebSocket support

#### Authentication & Authorization
- **Strategy**: Passport.js with local authentication
- **Session Management**: Express sessions with secure cookie handling
- **Password Security**: Scrypt-based password hashing with salt
- **Role-based Access**: User roles (farmer, supplier, buyer, admin)

#### AI Integration
- **Primary AI**: OpenAI GPT-4o for various AI-powered features
- **Farming Assistant**: Conversational AI for agricultural guidance
- **Plant Analysis**: Image-based plant disease and health analysis
- **Crop Predictions**: AI-powered yield prediction system
- **Weather Intelligence**: AI-enhanced weather analysis and recommendations

#### Real-time Features
- **WebSocket Support**: Multiple WebSocket implementations for different use cases
- **Chat System**: Comprehensive chat functionality with multiple backend options
- **Notifications**: Real-time notifications with WebSocket delivery
- **Social Features**: Live social interactions and updates

#### File Management
- **Upload System**: Multer-based file upload with local storage
- **Image Processing**: Support for various image formats
- **File Serving**: Static file serving through Express

## Data Flow

### User Authentication Flow
1. User submits credentials via frontend
2. Passport.js validates credentials against database
3. Session established with secure cookies
4. User object stored in session for subsequent requests

### AI-Powered Features Flow
1. User submits request (text, image, or data)
2. Backend processes request and formats for AI API
3. OpenAI API processes request and returns structured response
4. Backend stores results in database and returns to frontend
5. Frontend displays results with appropriate UI components

### Real-time Communication Flow
1. WebSocket connection established on user authentication
2. User actions trigger events sent through WebSocket
3. Server broadcasts relevant events to connected clients
4. Frontend updates UI in real-time based on received events

### Marketplace & Commerce Flow
1. Sellers create listings with product details and images
2. Buyers browse listings with advanced filtering
3. Cart management with session persistence
4. Payment processing through Stripe integration
5. Order fulfillment and tracking

## External Dependencies

### Core Services
- **Database**: Neon PostgreSQL serverless database
- **AI Services**: OpenAI API for GPT-4o model access
- **Email Service**: SendGrid for transactional emails
- **Payment Processing**: Stripe for secure payment handling

### Development Tools
- **Build System**: Vite with React plugin
- **Type Safety**: TypeScript with strict configuration
- **Code Quality**: ESLint and Prettier (configured)
- **Database Management**: Drizzle Kit for migrations

### Third-party Integrations
- **Weather Data**: OpenWeatherMap API integration
- **Stream Chat**: Stream Chat API for enhanced messaging
- **Calendar**: FullCalendar for scheduling and task management
- **Geospatial**: H3 hexagonal indexing for location-based features

## Deployment Strategy

### Development Environment
- **Runtime**: Replit with Node.js 20
- **Database**: PostgreSQL 16 with Neon connection
- **Development Server**: Vite dev server with hot reload
- **Port Configuration**: 5000 (main app), 6379 (Redis fallback)

### Production Deployment
- **Build Process**: Vite build for frontend, ESBuild for backend
- **Deployment Target**: Replit Autoscale
- **Static Assets**: Served through Express static middleware
- **Database Setup**: Automated through setup-db.js script

### Environment Configuration
- **Session Security**: Configurable session secret
- **Database Connection**: Environment-based database URL
- **API Keys**: Secure environment variable management
- **CORS**: Configured for production domains

## Changelog

- June 16, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.