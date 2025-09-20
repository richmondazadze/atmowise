# AtmoWise - Air Quality Health Application

## Overview

AtmoWise is a mobile-first web application that converts public air quality data into personalized lung-health guidance. The application integrates multiple air quality APIs, provides AI-powered health insights using LLM technology, and offers personalized recommendations based on user sensitivity profiles. Built as a full-stack application with React frontend and Express backend, it features real-time air quality monitoring, symptom tracking, timeline visualization, and emergency crisis support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Chart.js for data visualization of air quality and symptom timelines
- **Mobile-First Design**: Responsive design optimized for mobile devices with bottom navigation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Design**: RESTful API endpoints for air quality data, user profiles, symptoms, and AI insights
- **Session Management**: Express sessions with PostgreSQL storage
- **Error Handling**: Centralized error handling middleware

### Data Storage
- **Primary Database**: PostgreSQL hosted on Neon
- **Schema Design**: 
  - Users table for anonymous user tracking
  - Profiles table for user sensitivity settings and preferences
  - Air quality readings cache for performance optimization
  - Symptoms table for user health tracking
  - Resources and tips tables for health guidance
- **Caching Strategy**: Air quality data cached for 10 minutes to reduce API calls

### Authentication & User Management
- **Anonymous Users**: No registration required - users are created with anonymous IDs
- **Privacy-First**: Minimal data collection with optional profile information
- **Session Persistence**: Server-side sessions for user state management

### AI Integration
- **LLM Provider**: OpenAI API for generating health insights and recommendations
- **Context-Aware Responses**: AI considers user symptoms, air quality data, and sensitivity profile
- **Safety Features**: Automatic crisis detection and emergency resource activation

### Real-Time Data Pipeline
- **Air Quality APIs**: Primary integration with OpenWeather API, fallback to OpenAQ
- **Geolocation**: Browser geolocation API for current location air quality
- **Data Normalization**: Standardized air quality metrics (PM2.5, PM10, NO2, O3, AQI)
- **Risk Assessment**: Dynamic risk calculation based on air quality and user sensitivity

## External Dependencies

### Third-Party APIs
- **OpenWeather Air Pollution API**: Primary source for real-time air quality data
- **OpenAQ API**: Fallback air quality data provider
- **OpenAI API**: LLM integration for health insights and recommendations

### Database Services
- **Neon PostgreSQL**: Cloud-hosted PostgreSQL database with connection pooling
- **Database Migrations**: Drizzle Kit for schema management and migrations

### Development & Deployment
- **Vite**: Frontend build tool and development server
- **Replit Integration**: Development environment with cartographer and dev banner plugins
- **Environment Variables**: Secure API key and database URL management

### UI & Visualization
- **Radix UI**: Headless UI components for accessibility and customization
- **Lucide React**: Icon library for consistent iconography
- **Chart.js**: Data visualization for timeline charts and analytics
- **Tailwind CSS**: Utility-first CSS framework with custom design system

### Utility Libraries
- **Zod**: Schema validation for API inputs and data transformation
- **date-fns**: Date manipulation and formatting
- **clsx & class-variance-authority**: Conditional CSS class management
- **Wouter**: Lightweight routing library for React