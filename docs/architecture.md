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
│   ├── qrcode.ts         # QR code generation
│   └── redis.ts          # Caching layer
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

3. **Redis Service**

   - Caches frequently accessed data
   - Manages real-time features
   - Reduces database load
   - Chosen for: Performance, scalability

4. **Chat Services**

   - **Stream Chat Service**: Primary chat implementation using Stream's cloud service

     - Real-time messaging
     - Channel management
     - User presence
     - File sharing and media
     - Chosen for: Reliability, scalability, and rich features

   - **WebSocket Chat Services**:

     - **Basic WebSocket Service**: Direct WebSocket implementation
     - **Redis WebSocket Service**: Redis-backed for scalability
     - **Socket.IO Service**: Alternative implementation using Socket.IO
     - Chosen for: Flexibility and custom requirements

   - **Redis Chat Service**:
     - Pub/Sub messaging
     - Message caching
     - Real-time features
     - Chosen for: Performance at scale

5. **Upload Service**

   - Handles file uploads (images, documents)
   - Manages storage and retrieval
   - Implements file size and type restrictions
   - Chosen for: Secure file handling

6. **QR Code Service**

   - Generates QR codes for crop traceability
   - Creates verification links
   - Manages QR code data structure
   - Chosen for: Mobile accessibility

7. **H3 Service**

   - Geospatial calculations and mapping
   - Distance and bearing calculations
   - Location-based features
   - Chosen for: Geographic functionality

8. **Email Service**

   - Handles email notifications
   - Manages email templates
   - Tracks delivery status
   - Chosen for: User communication

9. **Social Notifications Service**
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

#### Redis Cache Layer

Used for:

- Session management
- Real-time data
- Cache frequently accessed data
- Temporary state storage

- **Why Redis?**
  - High performance
  - Built-in data structures
  - Pub/Sub capabilities
  - Automatic expiration

### Blockchain Integration

#### Hyperledger Fabric

```
Crop Lifecycle
└── Blockchain Events
    ├── Creation
    ├── Updates
    ├── Verification
    └── Marketplace Integration
```

- **Why Hyperledger Fabric?**
  - Permissioned blockchain
  - Low energy consumption
  - Enterprise-grade security
  - Flexible consensus mechanisms

## Data Flow

1. **Crop Creation**

   ```
   Client Request
   → API Endpoint
   → CropTrace Service
   → Database Storage
   → Blockchain Record
   → Response
   ```

2. **Verification Process**
   ```
   Verification Request
   → Load Crop Data
   → Fetch Blockchain History
   → Verify Transactions
   → Return Results
   ```

## Security Architecture

1. **Authentication**

   - JWT-based authentication
   - Session management
   - Role-based access control

2. **Blockchain Security**

   - Cryptographic verification
   - Immutable audit trail
   - Transaction signing

3. **Data Protection**
   - HTTPS encryption
   - Database encryption
   - Secure key management

## Scalability Considerations

1. **Horizontal Scaling**

   - Stateless services
   - Redis for session sharing
   - Load balancer ready

2. **Performance Optimization**

   - Caching strategy
   - Database indexing
   - Efficient queries

3. **Monitoring**
   - Performance metrics
   - Error tracking
   - Usage analytics

## Development Considerations

1. **Local Development**

   - Simulated blockchain
   - In-memory caching
   - Hot reloading

2. **Production Deployment**
   - Docker containers
   - Environment configuration
   - Automated deployment

## Future Considerations

1. **Planned Improvements**

   - Real blockchain network integration
   - Enhanced caching strategies
   - Additional security measures

2. **Scalability Enhancements**
   - Microservices separation
   - Database sharding
   - Geographic distribution

## Why This Architecture?

1. **Modularity**

   - Services are independent
   - Easy to maintain and test
   - Clear separation of concerns

2. **Scalability**

   - Horizontal scaling possible
   - Cache layer for performance
   - Efficient data access

3. **Security**

   - Multiple security layers
   - Blockchain verification
   - Data encryption

4. **Maintainability**
   - Clear code organization
   - Service independence
   - Documentation
