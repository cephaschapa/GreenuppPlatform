# MVC Architecture in Express.js

This document explains how to implement the Model-View-Controller (MVC) architectural pattern in Express.js applications.

## What is MVC?

MVC is a software architectural pattern that separates an application into three main components:

### 1. **Model** - Data and Business Logic

- Handles data access, validation, and business rules
- Represents the application's data structure
- Contains database operations and data manipulation logic
- **Location**: `server/models/`

### 2. **View** - Presentation Layer

- Handles the user interface and presentation
- In Express.js APIs, this is typically JSON/XML responses
- For web apps, this could be template engines (EJS, Pug, Handlebars)
- **Location**: `server/views/` (for templates) or response formatting in controllers

### 3. **Controller** - Request Handling

- Receives HTTP requests and coordinates between Model and View
- Contains route handlers and request/response logic
- Validates input and calls appropriate Model methods
- **Location**: `server/controllers/`

## Directory Structure

```
server/
├── models/           # Data models and database operations
│   ├── UserModel.ts
│   ├── HealthModel.ts
│   └── ProductModel.ts
├── controllers/      # Request handlers and route logic
│   ├── UserController.ts
│   ├── HealthController.ts
│   └── ProductController.ts
├── views/           # Templates (if using server-side rendering)
│   ├── layouts/
│   └── partials/
├── services/        # Business logic layer (optional)
│   ├── EmailService.ts
│   └── PaymentService.ts
├── middleware/      # Custom middleware
│   ├── auth.ts
│   └── validation.ts
├── routes/          # Route definitions
│   ├── users.ts
│   ├── health-mvc.ts
│   └── index-mvc.ts
├── config/          # Configuration files
│   ├── database.ts
│   └── app.ts
├── lib/            # Utilities and helpers
├── utils/          # Utility functions
└── index.ts        # App setup
```

## Example Implementation

### 1. Model (Data Layer)

```typescript
// server/models/UserModel.ts
export class UserModel {
  static async findById(id: string): Promise<User | null> {
    // Database operations
    const result = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
    return result.rows[0] || null;
  }

  static async create(userData: CreateUserData): Promise<User> {
    // Business logic and data validation
    const result = await db.execute(
      "INSERT INTO users (email, name) VALUES (?, ?) RETURNING *",
      [userData.email, userData.name]
    );
    return result.rows[0];
  }
}
```

### 2. Controller (Request Handling)

```typescript
// server/controllers/UserController.ts
export class UserController {
  static async show(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve user" });
    }
  }
}
```

### 3. Routes (URL Mapping)

```typescript
// server/routes/users.ts
import { UserController } from "../controllers/UserController.js";

const router = Router();

router.get("/:id", UserController.show);
router.post("/", UserController.create);
router.put("/:id", UserController.update);
router.delete("/:id", UserController.delete);

export default router;
```

## Benefits of MVC in Express.js

### 1. **Separation of Concerns**

- Models handle data logic
- Controllers handle request/response logic
- Views handle presentation logic

### 2. **Maintainability**

- Easy to modify one component without affecting others
- Clear responsibilities for each component
- Easier to test individual components

### 3. **Reusability**

- Models can be used by multiple controllers
- Controllers can be reused across different routes
- Business logic is centralized in models

### 4. **Scalability**

- Easy to add new features
- Clear structure for team development
- Consistent patterns across the application

## Best Practices

### 1. **Model Best Practices**

- Keep models focused on data operations
- Include data validation logic
- Use TypeScript interfaces for type safety
- Handle database errors gracefully

```typescript
export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.execute("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }
}
```

### 2. **Controller Best Practices**

- Keep controllers thin
- Handle HTTP-specific logic only
- Delegate business logic to models
- Consistent error handling

```typescript
export class UserController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { email, name } = req.body;

      // Validation
      if (!email || !name) {
        res.status(400).json({ error: "Email and name are required" });
        return;
      }

      const user = await UserModel.create({ email, name });
      res.status(201).json({ user });
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  }
}
```

### 3. **Route Best Practices**

- Keep routes simple and focused
- Use descriptive route names
- Group related routes together
- Use middleware for common functionality

```typescript
// server/routes/users.ts
const router = Router();

// Apply authentication middleware to all user routes
router.use(authMiddleware);

router.get("/", UserController.index);
router.get("/:id", UserController.show);
router.post("/", UserController.create);
router.put("/:id", UserController.update);
router.delete("/:id", UserController.delete);
```

## Migration from Current Structure

Your current project has some MVC elements but could be better organized. Here's how to migrate:

### Current Structure:

```
server/
├── routes/          # Mixed controllers and business logic
├── services/        # Business logic
├── lib/            # Utilities
└── index.ts        # App setup
```

### Target MVC Structure:

```
server/
├── models/         # Move data operations here
├── controllers/    # Extract route handlers here
├── services/       # Keep business logic here
├── routes/         # Keep route definitions here
├── middleware/     # Extract middleware here
└── index.ts        # App setup
```

## Example Migration Steps

1. **Extract Models**: Move database operations from routes to models
2. **Create Controllers**: Extract route handlers to controller classes
3. **Update Routes**: Simplify routes to just map URLs to controllers
4. **Add Middleware**: Extract common functionality to middleware
5. **Update Imports**: Update all import statements to reflect new structure

## Testing MVC Components

### Model Testing

```typescript
describe("UserModel", () => {
  it("should find user by ID", async () => {
    const user = await UserModel.findById("123");
    expect(user).toBeDefined();
  });
});
```

### Controller Testing

```typescript
describe("UserController", () => {
  it("should return 404 for non-existent user", async () => {
    const req = { params: { id: "999" } } as Request;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await UserController.show(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
```

## Conclusion

MVC architecture provides a clean, maintainable structure for Express.js applications. By separating concerns into Models, Views, and Controllers, you create code that is easier to understand, test, and maintain.

The key is to start small and gradually refactor your existing code to follow MVC principles. Focus on one component at a time and ensure each component has a single, clear responsibility.
