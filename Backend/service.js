
const Service = require('node-windows').Service;

// Create a new service object
const svc = new Service({
    name: 'Token_Application_Service',
    description: 'Backend Service for Token Application',
    script: 'D:\\Token_Application\\Backend\\index.js'
    
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

svc.on('uninstall', () => {
    console.log('Service uninstalled successfully.');
});

// svc.uninstall();

// Install the service
svc.install();