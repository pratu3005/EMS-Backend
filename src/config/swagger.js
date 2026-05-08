import swaggerUi from 'swagger-ui-express';

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Management System API',
      version: '1.0.0',
      description: 'Complete API documentation for Event Management System',
      contact: {
        name: 'EMS Support',
        email: 'support@ems.com'
      },
      license: {
        name: 'MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.ems.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            user_id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            password: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            is_deleted: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Event: {
          type: 'object',
          required: ['event_name', 'description', 'start_date_time', 'end_date_time', 'address', 'event_for'],
          properties: {
            event_id: { type: 'integer' },
            event_name: { type: 'string' },
            description: { type: 'string' },
            start_date_time: { type: 'string', format: 'date-time' },
            end_date_time: { type: 'string', format: 'date-time' },
            address: { type: 'string' },
            event_for: { type: 'string', enum: ['all', 'tssia_members'] },
            capacity: { type: 'integer' },
            entry_fee: { type: 'number' },
            category: { type: 'string' },
            organizer_name: { type: 'string' },
            organizer_email: { type: 'string', format: 'email' },
            organizer_phone: { type: 'string' },
            image_url: { type: 'string' },
            is_deleted: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            total_registrations: { type: 'integer' }
          }
        },
        Registration: {
          type: 'object',
          required: ['participant_name', 'participant_email', 'participant_phone', 'event_id'],
          properties: {
            registration_id: { type: 'integer' },
            participant_name: { type: 'string' },
            participant_email: { type: 'string', format: 'email' },
            participant_phone: { type: 'string' },
            event_id: { type: 'integer' },
            organization: { type: 'string' },
            designation: { type: 'string' },
            tssia_membership_id: { type: 'string' },
            pass_number: { type: 'string' },
            qr_code: { type: 'string' },
            registration_status: { type: 'string' },
            attendance_status: { type: 'string' }
          }
        },
        Pass: {
          type: 'object',
          properties: {
            pass_id: { type: 'integer' },
            registration_id: { type: 'integer' },
            pass_number: { type: 'string' },
            qr_code: { type: 'string' },
            participant_name: { type: 'string' },
            event_name: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'object' }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User registration, login, and profile management'
      },
      {
        name: 'Events',
        description: 'Event CRUD operations and listing'
      },
      {
        name: 'Registrations',
        description: 'Event registration and participant management'
      },
      {
        name: 'Participants',
        description: 'Participant information'
      },
      {
        name: 'Passes',
        description: 'Pass and QR code retrieval'
      },
      {
        name: 'Scans',
        description: 'QR code scanning and attendance marking'
      },
      {
        name: 'Dashboard',
        description: 'Admin dashboard statistics'
      }
    ],
    paths: {
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    username: { type: 'string' },
                    password: { type: 'string', minLength: 6 },
                    role: { type: 'string', enum: ['user', 'admin'], default: 'user' }
                  },
                  required: ['name', 'email', 'password']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/User' },
                          token: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            },
            400: { description: 'Validation error' },
            409: { description: 'Email already exists' }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                  },
                  required: ['email', 'password']
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/User' },
                          token: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { description: 'Invalid credentials' }
          }
        }
      },
      '/auth/profile': {
        get: {
          tags: ['Authentication'],
          summary: 'Get user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'User profile',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SuccessResponse' }
                }
              }
            },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/events': {
        get: {
          tags: ['Events'],
          summary: 'List all events',
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'pageSize',
              in: 'query',
              schema: { type: 'integer', default: 10, maximum: 100 }
            }
          ],
          responses: {
            200: {
              description: 'List of events',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { $ref: '#/components/schemas/Event' } },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          pageSize: { type: 'integer' },
                          totalPages: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Events'],
          summary: 'Create event (Admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Event' }
              }
            }
          },
          responses: {
            201: { description: 'Event created' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - Admin only' }
          }
        }
      },
      '/events/{eventId}': {
        get: {
          tags: ['Events'],
          summary: 'Get event details',
          parameters: [
            {
              name: 'eventId',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: {
              description: 'Event details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SuccessResponse' }
                }
              }
            },
            404: { description: 'Event not found' }
          }
        },
        put: {
          tags: ['Events'],
          summary: 'Update event (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'eventId',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Event' }
              }
            }
          },
          responses: {
            200: { description: 'Event updated' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' }
          }
        },
        delete: {
          tags: ['Events'],
          summary: 'Delete event (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'eventId',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: { description: 'Event deleted' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' }
          }
        }
      },
      '/registrations': {
        post: {
          tags: ['Registrations'],
          summary: 'Register participant for event',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Registration' }
              }
            }
          },
          responses: {
            201: {
              description: 'Registration successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          registration_id: { type: 'integer' },
                          pass_number: { type: 'string' },
                          qr_code: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        get: {
          tags: ['Registrations'],
          summary: 'Get all registrations',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'pageSize',
              in: 'query',
              schema: { type: 'integer', default: 10 }
            }
          ],
          responses: {
            200: { description: 'List of registrations' }
          }
        }
      },
      '/scans': {
        post: {
          tags: ['Scans'],
          summary: 'Scan QR code (Verifier only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    qr_code: { type: 'string' }
                  },
                  required: ['qr_code']
                }
              }
            }
          },
          responses: {
            200: { description: 'Scan processed' },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/passes/{registrationId}': {
        get: {
          tags: ['Passes'],
          summary: 'Get pass and QR code',
          parameters: [
            {
              name: 'registrationId',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: {
              description: 'Pass details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SuccessResponse' }
                }
              }
            }
          }
        }
      },
      '/dashboard': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get dashboard statistics (Admin only)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Dashboard statistics' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - Admin only' }
          }
        }
      }
    }
  },
  apis: []
};

export function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerOptions, { explorer: true }));
  
  // Also serve Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerOptions.definition);
  });
}
