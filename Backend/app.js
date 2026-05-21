require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require("./src/utils/db");
require('./src/models/setupModels'); // Initialize models and associations
const errorHandler = require('./src/utils/errorHandler');
const notFoundHandler = require('./src/utils/notFound');
const { createServer } = require("http");

// Route imports
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');
const picklistRoutes = require('./src/routes/picklists');
const packingRoutes = require('./src/routes/packing');
const putawayRoutes = require('./src/routes/putaway');
const shelfLocationRoutes = require('./src/routes/shelfLocations');
const inventoryRoutes = require('./src/routes/inventory');
const purchaseOrderRoutes = require('./src/routes/purchaseOrders');
const warehouseRoutes = require('./src/routes/warehouse');
const inboundShipmentRoutes = require('./src/routes/inboundShipments');
const supplierRoutes = require('./src/routes/suppliers');
const crossDockRoutes = require('./src/routes/crossDock');
const masterDataRoutes = require('./src/routes/masterData');
const transferOrderRoutes = require('./src/routes/transferOrders');
const requestLogger = require('./src/middleware/requestLogger');
const { securityHeaders, apiLimiter } = require('./src/middleware/security');
const logger = require('./src/utils/logger');

const app = express();
const server = createServer(app);

// Apply security headers
// app.use(securityHeaders);

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));               // increase limit if you expect large payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Apply request logger (Morgan -> Winston)
app.use(requestLogger);

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

app.get("/api/health", async (req, res) => {
    let dbOk = false;
    try {
        await sequelize.authenticate();
        dbOk = true;
    } catch (err) {
        logger.error(`DB connection failed: ${err.message}`);
    }

    res.json({
        status: dbOk ? "OK" : "DEGRADED",
        db: dbOk,
        timestamp: new Date().toISOString(),
    });
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/picklists', picklistRoutes);
app.use('/api/packing', packingRoutes);
app.use('/api/putaway', putawayRoutes);
app.use('/api/shelf-locations', shelfLocationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/inbound-shipments', inboundShipmentRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/cross-dock', crossDockRoutes);
app.use('/api/master-data', masterDataRoutes);
app.use('/api/transfer-orders', transferOrderRoutes);

// NotFound handling
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

module.exports = { app, server };