const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Swift Riders API",
      version: "1.0.0",
      description: "API documentation for Swift Riders",
    },
    servers: [
      {
        url: "https://swift-riders.onrender.com",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], 
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);



module.exports = { swaggerUi, swaggerSpec };