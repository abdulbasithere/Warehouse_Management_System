const { Product, InventoryLocation, ShelfLocation } = require('../models/setupModels');
const { Op } = require('sequelize');
const xlsx = require('xlsx');
const fs = require('fs');

const getAllProducts = async (req, res, next) => {
    try {
        const { search = '' } = req.query;
        const sequelize = Product.sequelize;
        const where = {};

        if (search) {
            where[Op.or] = [
                { ProductName: { [Op.like]: `%${search}%` } },
                { ProductId: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: products } = await Product.findAndCountAll({
            where,
            include: [{
                model: InventoryLocation,
                attributes: []
            }],
            attributes: {
                include: [
                    [
                        sequelize.fn('SUM', sequelize.literal('ISNULL(QuantityAvailable, 0) - ISNULL(QuantityReserved, 0)')),
                        'totalStock'
                    ]
                ]
            },
            group: ['Product.ProductId', 'Product.ProductName', 'Product.ProductDescription', 'Product.ProductPrice', 'Product.CreatedAt', 'Product.UpdatedAt'],
            order: [['ProductName', 'ASC']],
            subQuery: false
        });

        const mappedProducts = products.map(p => ({
            sku: p.ProductId,
            name: p.ProductName,
            description: p.ProductDescription,
            productPrice: p.ProductPrice,
            currentQuantity: parseInt(p.getDataValue('totalStock')) || 0,
            shelfLocationId: null
        }));

        res.json({ data: mappedProducts, total: count.length }); // Group by returns count as array of { ProductId, count }
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const { id, sku, name, description } = req.body;
        const productId = sku || id; // Use sku if provided by frontend, fallback to id
        console.log(req.body)

        if (!productId) {
            return res.status(400).json({ message: 'ProductId (sku) is required' });
        }

        const product = await Product.create({
            ProductId: productId,
            ProductName: name,
            ProductDescription: description || '',
            ProductPrice: req.body.price || 0
        });

        // Return mapped product for frontend consistency
        res.status(201).json({
            id: product.ProductId,
            sku: product.ProductId.toString(),
            name: product.ProductName,
            description: product.ProductDescription,
            productPrice: product.ProductPrice,
            currentQuantity: 0,
            shelfLocationId: null
        });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (name !== undefined) product.ProductName = name;
        if (description !== undefined) product.ProductDescription = description;
        if (req.body.price !== undefined) product.ProductPrice = req.body.price;

        await product.save();
        res.json({
            id: product.ProductId,
            sku: product.ProductId.toString(),
            name: product.ProductName,
            description: product.ProductDescription,
            productPrice: product.ProductPrice
        });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);
        console.log(product)
        if (!product) return res.status(404).json({ message: 'Product not found' });
        await product.destroy();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const bulkDeleteProducts = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Invalid IDs' });

        await Product.destroy({
            where: {
                ProductId: ids
            }
        });

        res.json({ message: `${ids.length} products deleted successfully` });
    } catch (error) {
        next(error);
    }
};

const bulkCreateProducts = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // When bulk creating, we extract ProductId (SKU) as well
        const productsToCreate = rows.map(row => ({
            ProductId: (row.ProductId || row.SKU || row.sku || row.Id || row.id || '').toString().trim(),
            ProductName: (row.ProductName || row.Name || row.name || '').toString().trim(),
            ProductDescription: (row.ProductDescription || row.Description || row.description || '').toString().trim(),
            ProductPrice: parseFloat(row.ProductPrice || row.Price || row.price || 0)
        })).filter(p => p.ProductName && p.ProductId);

        if (productsToCreate.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'No valid products found' });
        }

        await Product.bulkCreate(productsToCreate);

        fs.unlinkSync(req.file.path);
        res.json({
            message: `${productsToCreate.length} products imported successfully`
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        next(error);
    }
};

module.exports = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    bulkCreateProducts
};
