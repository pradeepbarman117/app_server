const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const fs = require('fs');

// Get all YAML files dynamically from the `swagger` folder
const swaggerFiles = fs
  .readdirSync(path.join(__dirname)) // Read files in the `swagger` directory
  .flatMap((dir) => {
    const fullPath = path.join(__dirname, dir);
    if (fs.statSync(fullPath).isDirectory()) {
      return fs
        .readdirSync(fullPath)
        .filter((file) => file.endsWith('.yaml'))
        .map((file) => path.join(fullPath, file));
    }
    return [];
  });

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      description: 'Comprehensive API documentation for all modules',
      version: '1.0.0',
    },
  },
  apis: swaggerFiles, // Load all YAML files
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
module.exports = swaggerDocs;
