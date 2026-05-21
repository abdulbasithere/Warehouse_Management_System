
const Service = require('node-windows').Service;

// Create a new service object
const svc = new Service({
    name: 'WMS_Backend_Service',
    description: 'Backend Service for WMS',
    script: 'E:\\WMS(Ecommerce)\\Backend\\server.js'

});

// Listen for the "install" event, which indicates the service is installed
svc.on('install', () => {
    console.log('Service installed successfully.');
    svc.start(); // Start the service after installation
});

// Listen for the "start" event
svc.on('start', () => {
    console.log(`Service ${svc.name} started successfully on port 3030`);
});

// Listen for the "stop" event
svc.on('stop', () => {
    console.log(`Service ${svc.name} stopped.`);
});

// Listen for the "error" event
svc.on('error', (err) => {
    console.error('Service error:', err);
});

// Listen for the "alreadyinstalled" event
svc.on('alreadyinstalled', () => {
    console.log('Service is already installed.');
});

// Install the service
svc.install();