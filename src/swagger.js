const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Account Management Microservice',
            version: '1.0.0',
            description: 'Account Management Microservice with RBAC'
        },
        servers: [
            { url: 'http://localhost:3001/api', description: 'Local API' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: { 
                    type: 'http', 
                    scheme: 'bearer', 
                    bearerFormat: 'JWT',
                    description: 'JWT token obtained from /auth/login'
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const spec = swaggerJSDoc(options);

function setupSwagger(app) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec, {
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'list',
            filter: true
        },
        customCss: '.swagger-ui .topbar { background-color: #2c3e50; }',
        customSiteTitle: 'Accounts Microservice API'
    }));

    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(spec);
    });

    console.log('Swagger UI available at http://localhost:3001/docs');
}

module.exports = setupSwagger;
