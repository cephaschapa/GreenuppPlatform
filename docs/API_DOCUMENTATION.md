# API Documentation - Plant Disease Diagnosis & Treatment System

## Overview

This document provides comprehensive API documentation for the GreenUpp Platform's plant disease diagnosis and treatment system. All endpoints return JSON responses and use standard HTTP status codes.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## Authentication

Most endpoints require authentication using session-based cookies. Include credentials in requests:

```javascript
fetch("/api/endpoint", {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
});
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "username": "farmer123",
  "email": "farmer@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "farmer"
}
```

**Response:**

```json
{
  "id": 1,
  "username": "farmer123",
  "email": "farmer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "farmer",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Login User

**POST** `/api/auth/login`

Authenticate user and create session.

**Request Body:**

```json
{
  "username": "farmer123",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "id": 1,
  "username": "farmer123",
  "email": "farmer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "farmer"
}
```

### Logout User

**POST** `/api/auth/logout`

Destroy user session.

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

### Get Current User

**GET** `/api/auth/me`

Get current authenticated user information.

**Response:**

```json
{
  "id": 1,
  "username": "farmer123",
  "email": "farmer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "farmer"
}
```

---

## Plant Analysis Endpoints

### Upload and Analyze Plant Image

**POST** `/api/plant-analysis`

Upload a plant image for disease analysis using AI.

**Request Body:**

```json
{
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "plantType": "tomato",
  "fieldId": 1,
  "cropId": 2,
  "notes": "Leaves showing yellow spots"
}
```

**Response:**

```json
{
  "id": 33,
  "userId": 1,
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "plantType": "tomato",
  "fieldId": 1,
  "cropId": 2,
  "analysisDate": "2024-01-15T10:30:00Z",
  "diseaseDetected": "Early Blight",
  "diseaseProbability": 0.85,
  "diseaseDescription": "Early blight is a common fungal disease affecting tomato plants...",
  "healthStatus": "moderate",
  "healthScore": 65,
  "nutrientDeficiencies": "Nitrogen deficiency detected",
  "recommendations": "Apply fungicide treatment and improve soil nutrition",
  "notes": "Leaves showing yellow spots"
}
```

### Get Plant Analysis

**GET** `/api/plant-analysis/:id`

Retrieve a specific plant analysis by ID.

**Response:**

```json
{
  "id": 33,
  "userId": 1,
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "plantType": "tomato",
  "fieldId": 1,
  "cropId": 2,
  "analysisDate": "2024-01-15T10:30:00Z",
  "diseaseDetected": "Early Blight",
  "diseaseProbability": 0.85,
  "diseaseDescription": "Early blight is a common fungal disease...",
  "healthStatus": "moderate",
  "healthScore": 65,
  "nutrientDeficiencies": "Nitrogen deficiency detected",
  "recommendations": "Apply fungicide treatment and improve soil nutrition",
  "notes": "Leaves showing yellow spots"
}
```

### List Plant Analyses

**GET** `/api/plant-analysis`

Get all plant analyses for the authenticated user.

**Query Parameters:**

- `limit` (optional): Number of results to return (default: 20)
- `offset` (optional): Number of results to skip (default: 0)
- `plantType` (optional): Filter by plant type
- `diseaseDetected` (optional): Filter by detected disease

**Response:**

```json
[
  {
    "id": 33,
    "userId": 1,
    "plantType": "tomato",
    "fieldId": 1,
    "cropId": 2,
    "analysisDate": "2024-01-15T10:30:00Z",
    "diseaseDetected": "Early Blight",
    "diseaseProbability": 0.85,
    "healthStatus": "moderate",
    "healthScore": 65
  }
]
```

---

## Treatment Plan Endpoints

### Generate Treatment Plan

**POST** `/api/treatment-plans/generate`

Generate a treatment plan from a plant analysis.

**Request Body:**

```json
{
  "analysisId": 33,
  "useAI": true
}
```

**Response:**

```json
{
  "id": 9,
  "userId": 1,
  "analysisId": 33,
  "title": "Treatment Plan for Early Blight",
  "description": "Comprehensive treatment plan for tomato early blight...",
  "diseaseType": "Early Blight",
  "severity": "medium",
  "estimatedDuration": 14,
  "createdAt": "2024-01-15T10:35:00Z",
  "steps": [
    {
      "id": 7,
      "treatmentPlanId": 9,
      "stepNumber": 1,
      "title": "Apply Fungicide Treatment",
      "description": "Apply copper-based fungicide to affected plants...",
      "treatmentType": "chemical",
      "productName": "Copper Fungicide",
      "activeIngredient": "Copper sulfate",
      "dosage": "2 tablespoons per gallon",
      "applicationMethod": "Foliar spray",
      "frequency": "Every 7 days",
      "duration": 3,
      "safetyNotes": "Wear protective equipment",
      "cost": 25.0,
      "costUnit": "USD",
      "isCompleted": false
    }
  ],
  "analysis": {
    "id": 33,
    "plantType": "tomato",
    "diseaseDetected": "Early Blight"
  },
  "recommendedProducts": [
    {
      "id": 1,
      "name": "Copper Fungicide",
      "description": "Effective against fungal diseases",
      "productType": "fungicide",
      "activeIngredient": "Copper sulfate",
      "targetDiseases": ["Early Blight", "Late Blight"],
      "targetCrops": ["Tomato", "Potato"]
    }
  ],
  "aiGenerated": true,
  "recommendations": [
    "Monitor plants daily for disease progression",
    "Improve air circulation around plants",
    "Avoid overhead watering"
  ],
  "warnings": [
    "Do not apply fungicide during hot weather",
    "Keep children and pets away during application"
  ],
  "costEstimate": {
    "total": 75.0,
    "currency": "USD",
    "breakdown": ["Fungicide: $25", "Equipment: $30", "Labor: $20"]
  }
}
```

### Get Treatment Plan

**GET** `/api/treatment-plans/:id`

Retrieve a specific treatment plan by ID.

**Response:**

```json
{
  "id": 9,
  "userId": 1,
  "analysisId": 33,
  "title": "Treatment Plan for Early Blight",
  "description": "Comprehensive treatment plan for tomato early blight...",
  "diseaseType": "Early Blight",
  "severity": "medium",
  "estimatedDuration": 14,
  "createdAt": "2024-01-15T10:35:00Z"
}
```

### Get Treatment Steps

**GET** `/api/treatment-plans/:id/steps`

Get all steps for a specific treatment plan.

**Response:**

```json
[
  {
    "id": 7,
    "treatmentPlanId": 9,
    "stepNumber": 1,
    "title": "Apply Fungicide Treatment",
    "description": "Apply copper-based fungicide to affected plants...",
    "treatmentType": "chemical",
    "productName": "Copper Fungicide",
    "activeIngredient": "Copper sulfate",
    "dosage": "2 tablespoons per gallon",
    "applicationMethod": "Foliar spray",
    "frequency": "Every 7 days",
    "duration": 3,
    "safetyNotes": "Wear protective equipment",
    "cost": 25.0,
    "costUnit": "USD",
    "isCompleted": false,
    "completedDate": null
  }
]
```

### Get Treatment Progress

**GET** `/api/treatment-plans/:id/progress`

Get progress tracking data for a treatment plan.

**Response:**

```json
[
  {
    "id": 1,
    "treatmentStepId": 7,
    "appliedDosage": "2 tablespoons per gallon",
    "weatherConditions": "Sunny, 75°F",
    "observations": "Plants showing improvement",
    "effectiveness": "good",
    "notes": "Applied as scheduled",
    "createdAt": "2024-01-15T11:00:00Z"
  }
]
```

---

## Treatment Step Endpoints

### Update Treatment Step

**PATCH** `/api/treatment-steps/:id`

Update the completion status of a treatment step.

**Request Body:**

```json
{
  "isCompleted": true,
  "completedDate": "2024-01-15T11:00:00Z"
}
```

**Response:**

```json
{
  "id": 7,
  "treatmentPlanId": 9,
  "stepNumber": 1,
  "title": "Apply Fungicide Treatment",
  "isCompleted": true,
  "completedDate": "2024-01-15T11:00:00Z"
}
```

### Get Treatment Step

**GET** `/api/treatment-steps/:id`

Retrieve a specific treatment step by ID.

**Response:**

```json
{
  "id": 7,
  "treatmentPlanId": 9,
  "stepNumber": 1,
  "title": "Apply Fungicide Treatment",
  "description": "Apply copper-based fungicide to affected plants...",
  "treatmentType": "chemical",
  "productName": "Copper Fungicide",
  "activeIngredient": "Copper sulfate",
  "dosage": "2 tablespoons per gallon",
  "applicationMethod": "Foliar spray",
  "frequency": "Every 7 days",
  "duration": 3,
  "safetyNotes": "Wear protective equipment",
  "cost": 25.0,
  "costUnit": "USD",
  "isCompleted": true,
  "completedDate": "2024-01-15T11:00:00Z"
}
```

### Create Treatment Progress

**POST** `/api/treatment-steps/:id/progress`

Record progress for a treatment step.

**Request Body:**

```json
{
  "appliedDosage": "2 tablespoons per gallon",
  "weatherConditions": "Sunny, 75°F",
  "observations": "Plants showing improvement",
  "effectiveness": "good",
  "notes": "Applied as scheduled"
}
```

**Response:**

```json
{
  "id": 1,
  "treatmentStepId": 7,
  "appliedDosage": "2 tablespoons per gallon",
  "weatherConditions": "Sunny, 75°F",
  "observations": "Plants showing improvement",
  "effectiveness": "good",
  "notes": "Applied as scheduled",
  "createdAt": "2024-01-15T11:00:00Z"
}
```

---

## Treatment Products Endpoints

### List Treatment Products

**GET** `/api/treatment-products`

Get available treatment products.

**Query Parameters:**

- `disease` (optional): Filter by target disease
- `crop` (optional): Filter by target crop

**Response:**

```json
[
  {
    "id": 1,
    "name": "Copper Fungicide",
    "description": "Effective against fungal diseases",
    "productType": "fungicide",
    "activeIngredient": "Copper sulfate",
    "applicationRate": "2 tablespoons per gallon",
    "safetyClass": "Caution",
    "reEntryInterval": "24 hours",
    "price": 25.0,
    "priceUnit": "USD",
    "targetDiseases": ["Early Blight", "Late Blight"],
    "targetCrops": ["Tomato", "Potato"],
    "availability": "In stock"
  }
]
```

### Get Treatment Product

**GET** `/api/treatment-products/:id`

Retrieve a specific treatment product by ID.

**Response:**

```json
{
  "id": 1,
  "name": "Copper Fungicide",
  "description": "Effective against fungal diseases",
  "productType": "fungicide",
  "activeIngredient": "Copper sulfate",
  "applicationRate": "2 tablespoons per gallon",
  "safetyClass": "Caution",
  "reEntryInterval": "24 hours",
  "price": 25.0,
  "priceUnit": "USD",
  "targetDiseases": ["Early Blight", "Late Blight"],
  "targetCrops": ["Tomato", "Potato"],
  "availability": "In stock"
}
```

---

## Field Management Endpoints

### List Fields

**GET** `/api/fields`

Get all fields for the authenticated user.

**Response:**

```json
[
  {
    "id": 1,
    "userId": 1,
    "name": "North Field",
    "location": "North side of property",
    "size": "5.00",
    "sizeUnit": "hectares",
    "soilType": "Loamy",
    "notes": "Main tomato field",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Create Field

**POST** `/api/fields`

Create a new field.

**Request Body:**

```json
{
  "name": "South Field",
  "location": "South side of property",
  "size": "3.5",
  "sizeUnit": "hectares",
  "soilType": "Sandy loam",
  "notes": "New field for rotation"
}
```

**Response:**

```json
{
  "id": 2,
  "userId": 1,
  "name": "South Field",
  "location": "South side of property",
  "size": "3.50",
  "sizeUnit": "hectares",
  "soilType": "Sandy loam",
  "notes": "New field for rotation",
  "createdAt": "2024-01-15T12:00:00Z"
}
```

---

## Crop Management Endpoints

### List Crops

**GET** `/api/crops`

Get all crops for the authenticated user.

**Response:**

```json
[
  {
    "id": 2,
    "userId": 1,
    "name": "Tomato Crop 2024",
    "variety": "Roma",
    "status": "growing",
    "fieldId": 1,
    "fieldSize": "2.5",
    "sizeUnit": "hectares",
    "plantingDate": "2024-03-15",
    "expectedHarvestDate": "2024-07-15",
    "expectedYield": "5000.00",
    "yieldUnit": "kg",
    "notes": "Main tomato crop"
  }
]
```

### Create Crop

**POST** `/api/crops`

Create a new crop.

**Request Body:**

```json
{
  "name": "Tomato Crop 2024",
  "variety": "Roma",
  "status": "planning",
  "fieldId": 1,
  "fieldSize": "2.5",
  "sizeUnit": "hectares",
  "plantingDate": "2024-03-15",
  "expectedHarvestDate": "2024-07-15",
  "expectedYield": "5000.00",
  "yieldUnit": "kg",
  "notes": "Main tomato crop"
}
```

**Response:**

```json
{
  "id": 2,
  "userId": 1,
  "name": "Tomato Crop 2024",
  "variety": "Roma",
  "status": "planning",
  "fieldId": 1,
  "fieldSize": "2.5",
  "sizeUnit": "hectares",
  "plantingDate": "2024-03-15",
  "expectedHarvestDate": "2024-07-15",
  "expectedYield": "5000.00",
  "yieldUnit": "kg",
  "notes": "Main tomato crop",
  "createdAt": "2024-01-15T12:00:00Z"
}
```

---

## Health Check Endpoints

### API Status

**GET** `/api/health`

Check API health status.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00Z",
  "version": "1.0.0"
}
```

---

## Data Types

### Plant Analysis

```typescript
interface PlantAnalysis {
  id: number;
  userId: number;
  imageData: string;
  plantType?: string;
  fieldId?: number;
  cropId?: number;
  analysisDate: Date;
  diseaseDetected?: string;
  diseaseProbability?: number;
  diseaseDescription?: string;
  healthStatus: "healthy" | "moderate" | "poor";
  healthScore: number;
  nutrientDeficiencies?: string;
  recommendations?: string;
  notes?: string;
}
```

### Treatment Plan

```typescript
interface TreatmentPlan {
  id: number;
  userId: number;
  analysisId: number;
  title: string;
  description: string;
  diseaseType: string;
  severity: "low" | "medium" | "high";
  estimatedDuration: number;
  createdAt: Date;
}
```

### Treatment Step

```typescript
interface TreatmentStep {
  id: number;
  treatmentPlanId: number;
  stepNumber: number;
  title: string;
  description: string;
  treatmentType: "chemical" | "organic" | "cultural" | "biological";
  productName?: string;
  activeIngredient?: string;
  dosage: string;
  applicationMethod: string;
  frequency: string;
  duration: number;
  safetyNotes: string;
  cost: number;
  costUnit: string;
  isCompleted: boolean;
  completedDate?: Date;
}
```

### Treatment Product

```typescript
interface TreatmentProduct {
  id: number;
  name: string;
  description?: string;
  productType: string;
  activeIngredient?: string;
  applicationRate?: string;
  safetyClass?: string;
  reEntryInterval?: string;
  price?: number;
  priceUnit?: string;
  targetDiseases: string[];
  targetCrops: string[];
  availability?: string;
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Analysis endpoints**: 10 requests per minute
- **Other endpoints**: 100 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

---

## WebSocket Events

For real-time updates, the system supports WebSocket connections:

### Connection

```javascript
const socket = io("http://localhost:3000");
```

### Events

**Treatment Step Updated**

```javascript
socket.on("treatment-step-updated", (data) => {
  console.log("Treatment step updated:", data);
});
```

**Analysis Completed**

```javascript
socket.on("analysis-completed", (data) => {
  console.log("Analysis completed:", data);
});
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
class GreenUppAPI {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:3000") {
    this.baseUrl = baseUrl;
  }

  async analyzePlant(imageData: string, plantType?: string) {
    const response = await fetch(`${this.baseUrl}/api/plant-analysis`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageData,
        plantType,
      }),
    });

    return response.json();
  }

  async generateTreatmentPlan(analysisId: number, useAI: boolean = true) {
    const response = await fetch(
      `${this.baseUrl}/api/treatment-plans/generate`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysisId,
          useAI,
        }),
      }
    );

    return response.json();
  }
}

// Usage
const api = new GreenUppAPI();
const analysis = await api.analyzePlant(imageData, "tomato");
const treatmentPlan = await api.generateTreatmentPlan(analysis.id);
```

### Python

```python
import requests
import base64

class GreenUppAPI:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()

    def analyze_plant(self, image_path, plant_type=None):
        with open(image_path, 'rb') as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')

        response = self.session.post(
            f"{self.base_url}/api/plant-analysis",
            json={
                "imageData": f"data:image/jpeg;base64,{image_data}",
                "plantType": plant_type
            }
        )

        return response.json()

    def generate_treatment_plan(self, analysis_id, use_ai=True):
        response = self.session.post(
            f"{self.base_url}/api/treatment-plans/generate",
            json={
                "analysisId": analysis_id,
                "useAI": use_ai
            }
        )

        return response.json()

# Usage
api = GreenUppAPI()
analysis = api.analyze_plant("plant_image.jpg", "tomato")
treatment_plan = api.generate_treatment_plan(analysis["id"])
```

---

## Error Codes

| Code                    | Description                                |
| ----------------------- | ------------------------------------------ |
| `INVALID_IMAGE_FORMAT`  | Unsupported image format                   |
| `IMAGE_TOO_LARGE`       | Image file size exceeds limit              |
| `ANALYSIS_FAILED`       | AI analysis failed                         |
| `TREATMENT_PLAN_EXISTS` | Treatment plan already exists for analysis |
| `INVALID_CREDENTIALS`   | Invalid username or password               |
| `UNAUTHORIZED`          | Authentication required                    |
| `FORBIDDEN`             | Insufficient permissions                   |
| `NOT_FOUND`             | Resource not found                         |
| `VALIDATION_ERROR`      | Request validation failed                  |
| `INTERNAL_ERROR`        | Internal server error                      |

---

## Support

For API support and questions:

- Create an issue in the GitHub repository
- Check the main README for setup instructions
- Review the inline code documentation
