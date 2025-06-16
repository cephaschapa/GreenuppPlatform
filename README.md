# Greenupp - AI-Powered Digital Agriculture Platform

<div align="center">
  <img src="client/src/assets/greenupp-full-logo.png" alt="Greenupp Logo" width="300"/>
  
  **Revolutionizing agriculture through AI-driven technology, blockchain traceability, and comprehensive digital farming solutions.**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
</div>

## 🌟 Overview

Greenupp is a cutting-edge Progressive Web Application (PWA) that empowers farmers with intelligent digital tools, comprehensive agricultural intelligence, and advanced social networking capabilities. The platform combines AI-powered insights, IoT integration, blockchain traceability, and community-driven knowledge sharing to transform modern farming.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database
- **API Keys** (see Environment Variables section)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd greenupp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration (see Environment Variables section)
   ```

4. **Setup database**
   ```bash
   # Create PostgreSQL database
   npm run db:push
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

The application will be available at:
- **Main site**: `http://localhost:5000`
- **Dashboard**: `http://app.localhost:5000` (when authenticated)

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Authentication**: Passport.js with session-based auth
- **Real-time**: Socket.IO + WebSocket
- **AI Integration**: OpenAI API + Anthropic Claude
- **Blockchain**: Hyperledger Fabric (CropTrace)
- **PWA**: Service Worker + Workbox

### Project Structure

```
greenupp/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/          # Utilities and configurations
│   │   └── assets/       # Images, fonts, etc.
├── server/                # Backend Express application
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic services
│   ├── utils/           # Utility functions
│   └── db.ts            # Database configuration
├── shared/               # Shared types and schemas
└── migrations/          # Database migrations
```

## 🛠️ Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/greenupp

# Session
SESSION_SECRET=your-super-secret-session-key

# OpenAI (for AI farming assistant)
OPENAI_API_KEY=sk-your-openai-api-key

# SendGrid (for email notifications)
SENDGRID_API_KEY=SG.your-sendgrid-api-key

# Weather API
OPENWEATHER_API_KEY=your-openweather-api-key
```

### Optional (for full features)
```env
# Stripe (for marketplace payments)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
VITE_STRIPE_PUBLIC_KEY=pk_test_your-stripe-public-key

# Stream Chat (for social features)
STREAM_API_KEY=your-stream-api-key
STREAM_API_SECRET=your-stream-api-secret
VITE_STREAM_API_KEY=your-stream-api-key

# Anthropic (alternative AI provider)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
```

## 📋 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Run TypeScript type checking
```

### Database
```bash
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio (database GUI)
npm run db:generate  # Generate migration files
```

### Testing & Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
```

## 🌟 Core Features

### 🤖 AI-Powered Farming Assistant
- **Smart Crop Recommendations**: AI-driven crop selection based on soil, climate, and market data
- **Yield Predictions**: Machine learning models for accurate harvest forecasting
- **Disease Detection**: Computer vision for plant health analysis
- **Personalized Advice**: Context-aware farming recommendations

### 🌾 Farm Management
- **Field Management**: Digital field mapping and crop tracking
- **Task Scheduling**: Automated reminders and workflow management
- **Weather Integration**: Real-time weather data and forecasting
- **Resource Planning**: Inventory and resource optimization

### 🔗 Blockchain Traceability (CropTrace)
- **Supply Chain Tracking**: End-to-end crop provenance
- **Quality Verification**: Immutable quality records
- **Consumer Trust**: Transparent product history
- **Compliance**: Automated regulatory reporting

### 🛒 Marketplace
- **B2B Trading**: Direct farmer-to-buyer connections
- **Location-Based Discovery**: Proximity-based seller matching
- **Secure Payments**: Stripe-powered transaction processing
- **Review System**: Trust and reputation management

### 👥 Social Networking (Green Socials)
- **Farmer Communities**: Knowledge sharing and collaboration
- **Expert Network**: Access to agricultural specialists
- **Discussion Forums**: Topic-based farming discussions
- **Success Stories**: Peer learning and inspiration

### 📱 Mobile-First PWA
- **Offline Capability**: Works without internet connection
- **Push Notifications**: Real-time alerts and reminders
- **Native-like Experience**: App-like interface and interactions
- **Cross-Platform**: Works on all devices and platforms

### 🌤️ Weather & Climate
- **Real-time Data**: Current weather conditions
- **Forecasting**: 7-day weather predictions
- **Climate Analysis**: Historical weather patterns
- **Custom Alerts**: Weather-based notifications

### 📊 Analytics & Insights
- **Performance Metrics**: Farm productivity analytics
- **Market Intelligence**: Price trends and market analysis
- **Predictive Analytics**: Data-driven decision support
- **Custom Reports**: Tailored insights and recommendations

## 🔧 Maintenance

### Regular Tasks

1. **Database Maintenance**
   ```bash
   # Backup database
   pg_dump greenupp > backup_$(date +%Y%m%d).sql
   
   # Update schema
   npm run db:push
   ```

2. **Dependency Updates**
   ```bash
   npm update
   npm audit fix
   ```

3. **Log Monitoring**
   ```bash
   # Check application logs
   tail -f logs/app.log
   
   # Monitor error rates
   grep "ERROR" logs/app.log | wc -l
   ```

### Performance Optimization

1. **Database Optimization**
   - Monitor slow queries
   - Update table statistics
   - Consider indexing for frequently accessed data

2. **Frontend Optimization**
   - Bundle size analysis: `npm run build --analyze`
   - Image optimization
   - Code splitting and lazy loading

3. **Caching Strategy**
   - API response caching
   - Static asset caching
   - Service Worker optimization

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Farm Management
- `GET /api/fields` - List user fields
- `POST /api/fields` - Create new field
- `GET /api/crops` - List crops
- `POST /api/crops` - Create new crop

### AI Services
- `POST /api/crops/:id/predictions` - Generate yield predictions
- `POST /api/plant-analyses` - Analyze plant images
- `POST /api/farming-assistant/chat` - AI chat assistant

### Marketplace
- `GET /api/marketplace/listings` - Browse listings
- `POST /api/marketplace/listings` - Create listing
- `GET /api/marketplace/sellers` - Find sellers

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation
- Ensure mobile responsiveness

## 🔒 Security

- Session-based authentication with secure cookies
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- CORS protection
- Rate limiting on API endpoints
- Environment variable protection

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Community**: Join our Discord community
- **Email**: support@greenupp.com

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   export NODE_ENV=production
   export DATABASE_URL=your-production-db-url
   ```

3. **Run database migrations**
   ```bash
   npm run db:push
   ```

4. **Start the server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Monitoring

### Health Checks
- Database connectivity: `GET /api/health/db`
- API status: `GET /api/health/status`
- Service dependencies: `GET /api/health/services`

### Metrics
- Response times
- Error rates
- User activity
- Database performance

---

**Built with ❤️ for the farming community**

*Greenupp - Transforming agriculture through technology*