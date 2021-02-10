const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Table Planner User APIs',
    description: 'Currently Active APIs For Table Planner User Page',
  },
  schemes: ['http', 'https'],
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);