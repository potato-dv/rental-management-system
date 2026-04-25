const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Rental Management API",
    version: "1.0.0",
    description: "API documentation for the Rental Management System backend.",
  },
  servers: [
    {
      url: "http://localhost:8000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Units" },
    { name: "Tenants" },
    { name: "Applications" },
    { name: "Leases" },
    { name: "Payments" },
    { name: "Maintenance" },
    { name: "Dashboard" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      GenericObject: {
        type: "object",
        additionalProperties: true,
      },
      AuthRegisterRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "John Doe" },
          email: { type: "string", example: "john@example.com" },
          password: { type: "string", example: "secret123" },
          role: {
            type: "string",
            enum: ["admin", "tenant"],
            example: "tenant",
          },
        },
      },
      AuthLoginRequest: {
        type: "object",
        properties: {
          email: { type: "string", example: "john@example.com" },
          password: { type: "string", example: "secret123" },
        },
      },
      UnitUpdateRequest: {
        type: "object",
        properties: {
          price: { type: "number", example: 12000 },
          status: { type: "string", example: "occupied" },
          description: { type: "string", example: "2-bedroom apartment" },
        },
      },
      TenantUpdateRequest: {
        type: "object",
        additionalProperties: true,
      },
      ApplicationCreateRequest: {
        type: "object",
        additionalProperties: true,
      },
      ApplicationStatusUpdateRequest: {
        type: "object",
        properties: {
          status: { type: "string", example: "approved" },
        },
      },
      LeaseCreateRequest: {
        type: "object",
        additionalProperties: true,
      },
      LeaseUpdateRequest: {
        type: "object",
        additionalProperties: true,
      },
      PaymentCreateRequest: {
        type: "object",
        additionalProperties: true,
      },
      MaintenanceCreateRequest: {
        type: "object",
        additionalProperties: true,
      },
      MaintenanceStatusUpdateRequest: {
        type: "object",
        properties: {
          status: { type: "string", example: "in_progress" },
        },
      },
      MaintenancePriorityUpdateRequest: {
        type: "object",
        properties: {
          priority: { type: "string", example: "high" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Internal Server Error" },
        },
      },
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["Health"],
        summary: "Health check endpoint",
        responses: {
          200: {
            description: "API is running",
          },
        },
      },
    },

    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AuthRegisterRequest",
              },
            },
          },
        },
        responses: {
          201: { description: "User registered" },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AuthLoginRequest",
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Current user data" },
          401: { description: "Unauthorized" },
        },
      },
    },

    "/api/units": {
      get: {
        tags: ["Units"],
        summary: "Get all units",
        responses: {
          200: { description: "Units fetched" },
        },
      },
    },
    "/api/units/{id}": {
      get: {
        tags: ["Units"],
        summary: "Get unit by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Unit fetched" },
          404: { description: "Unit not found" },
        },
      },
      put: {
        tags: ["Units"],
        summary: "Update unit (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UnitUpdateRequest" },
            },
          },
        },
        responses: {
          200: { description: "Unit updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },

    "/api/tenants/profile/me": {
      get: {
        tags: ["Tenants"],
        summary: "Get tenant profile (tenant only)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Tenant profile fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
      put: {
        tags: ["Tenants"],
        summary: "Update tenant profile (tenant only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TenantUpdateRequest" },
            },
          },
        },
        responses: {
          200: { description: "Tenant profile updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/tenants": {
      get: {
        tags: ["Tenants"],
        summary: "Get all tenants (admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Tenants fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/tenants/{id}": {
      get: {
        tags: ["Tenants"],
        summary: "Get tenant by ID (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Tenant fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Tenant not found" },
        },
      },
      put: {
        tags: ["Tenants"],
        summary: "Update tenant by ID (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TenantUpdateRequest" },
            },
          },
        },
        responses: {
          200: { description: "Tenant updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
      delete: {
        tags: ["Tenants"],
        summary: "Delete tenant by ID (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Tenant deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },

    "/api/applications/my/applications": {
      get: {
        tags: ["Applications"],
        summary: "Get my applications (tenant only)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Applications fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/applications": {
      post: {
        tags: ["Applications"],
        summary: "Create application (tenant only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApplicationCreateRequest" },
            },
          },
        },
        responses: {
          201: { description: "Application created" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
      get: {
        tags: ["Applications"],
        summary: "Get all applications (admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Applications fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/applications/{id}": {
      get: {
        tags: ["Applications"],
        summary: "Get application by ID (admin/tenant)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Application fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Application not found" },
        },
      },
      delete: {
        tags: ["Applications"],
        summary: "Delete application by ID (admin/tenant)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Application deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/applications/{id}/status": {
      put: {
        tags: ["Applications"],
        summary: "Update application status (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ApplicationStatusUpdateRequest",
              },
            },
          },
        },
        responses: {
          200: { description: "Application status updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },

    "/api/leases/my/lease": {
      get: {
        tags: ["Leases"],
        summary: "Get my lease (tenant only)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Lease fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/leases": {
      get: {
        tags: ["Leases"],
        summary: "Get all leases (admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Leases fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
      post: {
        tags: ["Leases"],
        summary: "Create lease (admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LeaseCreateRequest" },
            },
          },
        },
        responses: {
          201: { description: "Lease created" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/leases/{id}": {
      get: {
        tags: ["Leases"],
        summary: "Get lease by ID (admin/tenant)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Lease fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Lease not found" },
        },
      },
      put: {
        tags: ["Leases"],
        summary: "Update lease by ID (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LeaseUpdateRequest" },
            },
          },
        },
        responses: {
          200: { description: "Lease updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/leases/{id}/terminate": {
      put: {
        tags: ["Leases"],
        summary: "Terminate lease by ID (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Lease terminated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },

    "/api/payments/my/payments": {
      get: {
        tags: ["Payments"],
        summary: "Get my payments (tenant only)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Payments fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/payments": {
      get: {
        tags: ["Payments"],
        summary: "Get all payments (admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Payments fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
      post: {
        tags: ["Payments"],
        summary: "Create payment (admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaymentCreateRequest" },
            },
          },
        },
        responses: {
          201: { description: "Payment created" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/payments/{id}": {
      get: {
        tags: ["Payments"],
        summary: "Get payment by ID (admin/tenant)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Payment fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Payment not found" },
        },
      },
      put: {
        tags: ["Payments"],
        summary: "Update payment by ID (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GenericObject" },
            },
          },
        },
        responses: {
          200: { description: "Payment updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
      delete: {
        tags: ["Payments"],
        summary: "Delete payment by ID (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Payment deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/payments/{id}/record": {
      post: {
        tags: ["Payments"],
        summary: "Record tenant payment (tenant only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GenericObject" },
            },
          },
        },
        responses: {
          200: { description: "Payment recorded" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/payments/{id}/verify": {
      put: {
        tags: ["Payments"],
        summary: "Verify payment (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Payment verified" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },

    "/api/maintenance/my/requests": {
      get: {
        tags: ["Maintenance"],
        summary: "Get my maintenance requests (tenant only)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Maintenance requests fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/maintenance": {
      get: {
        tags: ["Maintenance"],
        summary: "Get all maintenance requests (admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Maintenance requests fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
      post: {
        tags: ["Maintenance"],
        summary: "Create maintenance request (tenant only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MaintenanceCreateRequest" },
            },
          },
        },
        responses: {
          201: { description: "Maintenance request created" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/maintenance/{id}": {
      get: {
        tags: ["Maintenance"],
        summary: "Get maintenance request by ID (admin/tenant)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Maintenance request fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
      delete: {
        tags: ["Maintenance"],
        summary: "Delete maintenance request by ID (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Maintenance request deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/maintenance/{id}/status": {
      put: {
        tags: ["Maintenance"],
        summary: "Update maintenance status (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MaintenanceStatusUpdateRequest",
              },
            },
          },
        },
        responses: {
          200: { description: "Maintenance status updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/maintenance/{id}/priority": {
      put: {
        tags: ["Maintenance"],
        summary: "Update maintenance priority (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MaintenancePriorityUpdateRequest",
              },
            },
          },
        },
        responses: {
          200: { description: "Maintenance priority updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },

    "/api/dashboard/admin": {
      get: {
        tags: ["Dashboard"],
        summary: "Get admin dashboard data",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Admin dashboard fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/dashboard/financial": {
      get: {
        tags: ["Dashboard"],
        summary: "Get financial summary",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Financial summary fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/dashboard/tenant": {
      get: {
        tags: ["Dashboard"],
        summary: "Get tenant dashboard data",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Tenant dashboard fetched" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
