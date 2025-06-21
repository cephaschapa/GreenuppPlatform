# GreenUpp Platform - Plant Disease Diagnosis & Treatment System

A comprehensive agricultural platform that combines AI-powered plant disease diagnosis with intelligent treatment plan generation and tracking.

## 🌱 Features

### Plant Disease Diagnosis

- **AI-Powered Analysis**: Upload plant images for instant disease detection using OpenAI's GPT-4 Vision
- **Multi-Format Support**: Handles PNG, JPEG, GIF, and WebP image formats
- **Detailed Reports**: Get comprehensive analysis including disease probability, health scores, and recommendations
- **Field Integration**: Link analyses to specific fields and crops for better tracking

### Treatment Plan Generation

- **AI-Generated Plans**: Intelligent treatment recommendations based on disease type and severity
- **Rule-Based Fallback**: Reliable treatment plans when AI is unavailable
- **Product Recommendations**: Suggests appropriate treatment products based on detected diseases
- **Cost Estimation**: Provides detailed cost breakdowns for treatment plans

### Treatment Tracking

- **Step-by-Step Progress**: Track individual treatment steps with completion status
- **Progress Monitoring**: Record application details, weather conditions, and effectiveness
- **Treatment History**: Maintain comprehensive records of all treatments applied
- **Performance Analytics**: Monitor treatment effectiveness over time

### User Management

- **Farmer Profiles**: Comprehensive farmer profile management
- **Field Management**: Organize crops and analyses by field
- **Crop Tracking**: Monitor crop health and development throughout the season

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd platform
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Configure the following variables:

   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/greenupp
   OPENAI_API_KEY=your_openai_api_key
   SESSION_SECRET=your_session_secret_here
   ```

4. **Set up the database**

   ```bash
   npm run db:setup
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
platform/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
├── server/                # Backend Node.js application
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   ├── services/          # Business logic services
│   └── utils/             # Utility functions
├── shared/                # Shared TypeScript types and schemas
│   └── schema.ts          # Database schema definitions
└── docs/                  # Documentation
```

## 🔧 API Endpoints

### Plant Analysis

- `POST /api/plant-analysis` - Upload and analyze plant images
- `GET /api/plant-analysis/:id` - Get analysis details
- `GET /api/plant-analysis` - List user's analyses

### Treatment Plans

- `POST /api/treatment-plans/generate` - Generate treatment plan from analysis
- `GET /api/treatment-plans/:id` - Get treatment plan details
- `GET /api/treatment-plans/:id/steps` - Get treatment steps
- `PATCH /api/treatment-steps/:id` - Update treatment step progress

### User Management

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## 🖼️ Image Processing

The system handles image uploads with the following workflow:

1. **Frontend**: Converts uploaded files to base64 data URLs
2. **Backend**: Validates image format and converts to OpenAI-compatible format
3. **AI Analysis**: Sends properly formatted images to OpenAI for disease detection
4. **Response Processing**: Parses AI response and stores analysis results

### Supported Image Formats

- PNG (Portable Network Graphics)
- JPEG (Joint Photographic Experts Group)
- GIF (Graphics Interchange Format)
- WebP (Web Picture format)

## 🤖 AI Integration

### OpenAI Configuration

The system uses OpenAI's GPT-4 Vision model for plant disease analysis:

```typescript
// Example AI analysis request
const analysis = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "Analyze this plant image for diseases..." },
        { type: "image_url", image_url: { url: "data:image/jpeg;base64,..." } },
      ],
    },
  ],
});
```

### Treatment Plan Generation

AI-generated treatment plans include:

- Disease-specific treatment recommendations
- Product suggestions with dosages
- Safety considerations
- Cost estimates
- Application timing and frequency

## 📊 Database Schema

### Core Tables

- `users` - User accounts and profiles
- `fields` - Agricultural field management
- `crops` - Crop tracking and management
- `plant_analyses` - Disease analysis results
- `treatment_plans` - Generated treatment plans
- `treatment_steps` - Individual treatment steps
- `treatment_products` - Available treatment products

### Relationships

- Users can have multiple fields
- Fields can have multiple crops
- Plant analyses are linked to fields and crops
- Treatment plans are generated from analyses
- Treatment steps belong to treatment plans

## 🔒 Security Features

- **Session-based Authentication**: Secure user sessions with Redis
- **Input Validation**: Comprehensive validation of all user inputs
- **Image Validation**: Secure image processing with format validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **SQL Injection Protection**: Parameterized queries throughout

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Test Coverage

```bash
npm run test:coverage
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_secure_session_secret
REDIS_URL=your_redis_url
```

## 📈 Monitoring and Logging

The system includes comprehensive logging:

- Request/response logging
- Error tracking and reporting
- Performance monitoring
- Database query logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation in the `docs/` folder
- Review the API documentation

## 🔄 Recent Updates

### Latest Features

- ✅ AI-powered plant disease diagnosis
- ✅ Intelligent treatment plan generation
- ✅ Treatment progress tracking
- ✅ Multi-format image support
- ✅ Cost estimation for treatments
- ✅ Field and crop management integration

### Bug Fixes

- ✅ Fixed image format detection and validation
- ✅ Resolved OpenAI API integration issues
- ✅ Fixed treatment step date handling
- ✅ Improved error handling and user feedback
