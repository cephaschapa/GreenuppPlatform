# GreenUpp Platform Architecture

## Overview

GreenUpp is a modern agricultural platform built with a microservices-inspired architecture, focusing on scalability, maintainability, and real-time capabilities. The platform integrates blockchain technology for crop traceability while maintaining high performance and reliability.

## Core Components

### Server Architecture

```
server/
├── services/          # Core business logic services
│   ├── hyperledger.ts    # Blockchain integration
│   ├── croptrace.ts      # Crop traceability
│   ├── stream-chat.ts    # Real-time messaging
│   ├── upload.ts         # File handling
│   ├── email.ts          # Email notifications
│   └── h3.ts            # Geospatial features
├── routes/            # API endpoints
├── db/                # Database configuration
└── middleware/        # Request processing
```

#### Key Services

1. **CropTrace Service**

   - Manages crop lifecycle tracking
   - Integrates with blockchain for verification
   - Handles event recording and verification
   - Chosen for: Separation of concerns, maintainability

2. **Hyperledger Service**

   - Manages blockchain interactions
   - Handles transaction verification
   - Maintains blockchain state
   - Chosen for: Security, immutability, trust

3. **Stream Chat Service**

   - Real-time messaging using Stream's cloud service
   - Channel management (direct and group chats)
   - User presence and online status
   - File sharing and media support
   - Message history and search
   - Chosen for: Production-ready scalability, reliability, and rich features

4. **Upload Service**

   - Handles file uploads (images, documents)
   - Manages storage and retrieval
   - Implements file size and type restrictions
   - Chosen for: Secure file handling

5. **H3 Service**

   - Geospatial calculations and mapping
   - Distance and bearing calculations
   - Location-based features
   - Chosen for: Geographic functionality

6. **Email Service**

   - Handles email notifications
   - Manages email templates
   - Tracks delivery status
   - Chosen for: User communication

7. **Social Notifications Service**
   - Manages platform notifications
   - Handles user interactions
   - Integrates with email service
   - Chosen for: User engagement

Each service is designed as a singleton instance to ensure consistent state management and resource utilization across the application. The services are loosely coupled, allowing for independent scaling and maintenance.

### Database Architecture

#### PostgreSQL Database

```sql
-- Core Tables
crops
├── id
├── user_id
├── name
├── variety
├── status
├── batch_id           # For blockchain tracing
└── blockchain_tx_id   # Transaction reference

crop_trace_events
├── id
├── crop_id
├── event_type
├── description
├── blockchain_tx_id
└── blockchain_tx_hash

marketplace_listings
├── id
├── seller_id
├── title
├── source_crop_id     # Links to traceable crop
└── blockchain_verified
```

- **Why PostgreSQL?**
  - ACID compliance for data integrity
  - Rich query capabilities
  - JSON support for flexible data
  - Strong ecosystem and tooling

### Blockchain Integration

#### Hyperledger Fabric

```

```
