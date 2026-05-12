const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "FlavorHaven Restaurant API",
    version: "1.0.0",
    description:
      "REST API for the FlavorHaven Restaurant ordering platform. Use the **Authorize** button to supply a Bearer JWT obtained from `POST /api/auth/login`.",
  },
  servers: [{ url: "/api", description: "API base path" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Jane Doe" },
          email: { type: "string", format: "email", example: "jane@example.com" },
          role: { type: "string", enum: ["USER", "ADMIN"], example: "USER" },
          avatarUrl: { type: "string", nullable: true, example: null },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Pizza" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Food: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Margherita Pizza" },
          description: { type: "string", example: "Classic tomato and mozzarella pizza" },
          price: { type: "string", example: "12.99" },
          imageUrl: { type: "string", example: "https://example.com/pizza.jpg" },
          categoryId: { type: "integer", example: 1 },
          category: { $ref: "#/components/schemas/Category" },
          avgRating: { type: "number", nullable: true, example: 4.5 },
          reviewCount: { type: "integer", example: 12 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Review: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          userId: { type: "integer", example: 2 },
          foodId: { type: "integer", example: 1 },
          rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
          comment: { type: "string", nullable: true, example: "Amazing pizza!" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          user: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
            },
          },
        },
      },
      OrderItem: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          orderId: { type: "integer", example: 1 },
          foodId: { type: "integer", example: 3 },
          quantity: { type: "integer", example: 2 },
          price: { type: "string", example: "12.99" },
          food: { $ref: "#/components/schemas/Food" },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          userId: { type: "integer", example: 2 },
          totalPrice: { type: "string", example: "25.98" },
          status: {
            type: "string",
            enum: ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"],
            example: "PENDING",
          },
          deliveryAddress: { type: "string", nullable: true, example: "123 Main St, Springfield" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          items: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
          user: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              email: { type: "string" },
            },
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string", example: "Unauthorized" },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "Missing or invalid JWT",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      Forbidden: {
        description: "Insufficient permissions (admin required)",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      NotFound: {
        description: "Resource not found",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
    },
  },

  paths: {
    // ─── Auth ────────────────────────────────────────────────────────────────
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Jane Doe" },
                  email: { type: "string", format: "email", example: "jane@example.com" },
                  password: { type: "string", minLength: 6, example: "secret123" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "400": { description: "Validation error or email already in use" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and receive a JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "admin@flavorhaven.com" },
                  password: { type: "string", example: "admin123" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      put: {
        tags: ["Auth"],
        summary: "Update current user profile (name, email, avatarUrl)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Jane Smith" },
                  email: { type: "string", format: "email" },
                  avatarUrl: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated user",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
          },
          "400": { description: "Validation error" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      delete: {
        tags: ["Auth"],
        summary: "Delete current user account",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Account deleted" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/auth/me/password": {
      put: {
        tags: ["Auth"],
        summary: "Change current user password",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: { type: "string", example: "oldpassword" },
                  newPassword: { type: "string", minLength: 6, example: "newpassword" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Password updated" },
          "400": { description: "Current password incorrect or validation error" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },

    // ─── Categories ─────────────────────────────────────────────────────────
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List all categories",
        responses: {
          "200": {
            description: "Array of categories",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Category" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Create a category (admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: { name: { type: "string", example: "Sushi" } },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created category",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Category" } } },
          },
          "400": { description: "Name missing or category already exists" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/categories/{id}": {
      delete: {
        tags: ["Categories"],
        summary: "Delete a category (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": { description: "Category deleted" },
          "400": { description: "Category has foods attached" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    // ─── Foods ──────────────────────────────────────────────────────────────
    "/foods": {
      get: {
        tags: ["Foods"],
        summary: "List all foods",
        parameters: [
          { name: "categoryId", in: "query", schema: { type: "integer" }, description: "Filter by category" },
          { name: "search", in: "query", schema: { type: "string" }, description: "Search by name" },
        ],
        responses: {
          "200": {
            description: "Array of food items",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Food" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Foods"],
        summary: "Create a food item (admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "description", "price", "imageUrl", "categoryId"],
                properties: {
                  name: { type: "string", example: "Pepperoni Pizza" },
                  description: { type: "string", example: "Loaded with pepperoni" },
                  price: { type: "number", example: 14.99 },
                  imageUrl: { type: "string", example: "https://example.com/pepperoni.jpg" },
                  categoryId: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created food item",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Food" } } },
          },
          "400": { description: "Validation error" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/foods/{id}": {
      get: {
        tags: ["Foods"],
        summary: "Get a single food item",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "Food item",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Food" } } },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      put: {
        tags: ["Foods"],
        summary: "Update a food item (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  imageUrl: { type: "string" },
                  categoryId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated food item",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Food" } } },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Foods"],
        summary: "Delete a food item (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": { description: "Food item deleted" },
          "400": { description: "Food is referenced in existing orders" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    // ─── Orders ─────────────────────────────────────────────────────────────
    "/orders": {
      post: {
        tags: ["Orders"],
        summary: "Place a new order",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["items", "deliveryAddress"],
                properties: {
                  deliveryAddress: { type: "string", example: "123 Main St, Springfield" },
                  items: {
                    type: "array",
                    minItems: 1,
                    items: {
                      type: "object",
                      required: ["foodId", "quantity"],
                      properties: {
                        foodId: { type: "integer", example: 1 },
                        quantity: { type: "integer", minimum: 1, example: 2 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Order created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Order" } } },
          },
          "400": { description: "Validation error or food not found" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      get: {
        tags: ["Orders"],
        summary: "Get current user's orders",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Array of orders",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Order" } },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/orders/admin": {
      get: {
        tags: ["Orders"],
        summary: "Get all orders (admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Array of all orders with user details",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Order" } },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/orders/{id}/status": {
      patch: {
        tags: ["Orders"],
        summary: "Update order status (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"],
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated order",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Order" } } },
          },
          "400": { description: "Invalid status value" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/orders/{id}/cancel": {
      patch: {
        tags: ["Orders"],
        summary: "Cancel a pending order (order owner only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "Cancelled order",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Order" } } },
          },
          "400": { description: "Order is not in PENDING status" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { description: "Not the order owner" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    // ─── Reviews ────────────────────────────────────────────────────────────
    "/reviews/food/{foodId}": {
      get: {
        tags: ["Reviews"],
        summary: "Get reviews for a food item",
        parameters: [
          { name: "foodId", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "Array of reviews",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Review" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Reviews"],
        summary: "Create or update a review (authenticated users)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "foodId", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["rating"],
                properties: {
                  rating: { type: "integer", minimum: 1, maximum: 5, example: 4 },
                  comment: { type: "string", nullable: true, example: "Really tasty!" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Created or updated review",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Review" } } },
          },
          "400": { description: "Rating out of range" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      delete: {
        tags: ["Reviews"],
        summary: "Delete own review for a food item",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "foodId", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": { description: "Review deleted" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { description: "Not the review owner" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    // ─── Users ──────────────────────────────────────────────────────────────
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List all users with order counts (admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Array of users",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    allOf: [
                      { $ref: "#/components/schemas/User" },
                      {
                        type: "object",
                        properties: {
                          _count: {
                            type: "object",
                            properties: { orders: { type: "integer" } },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
  },
};

export default swaggerDocument;
