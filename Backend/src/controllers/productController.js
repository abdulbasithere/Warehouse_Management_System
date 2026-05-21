import { Product, ProductVariant, InventoryLocation, ProductBarcode } from '../models/setupModels.js';
import sequelize from '../utils/db.js';
import { Op } from 'sequelize';
import xlsx from 'xlsx';
import fs from 'fs';

export const getProducts = async (req, res, next) => {
    try {
        const { search = '', page = 1, pageSize = 25 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(pageSize);
        const isNumeric = search && /^\d+$/.test(search.trim());

        // Barcode matched productIds — direct lookup, no JOIN
        let barcodeMatchedIds = [];
        if (search) {
            const barcodeMatches = await ProductBarcode.findAll({
                attributes: ['productId'],
                where: {
                    barcode: { [Op.like]: `%${search}%` },
                    isActive: true
                },
                raw: true
            });
            barcodeMatchedIds = [...new Set(barcodeMatches.map(b => b.productId))];
        }

        // finalWhere — name OR productId OR barcode-matched productIds
        let finalWhere = {};
        if (search) {
            const orConditions = [
                { name: { [Op.like]: `%${search}%` } },
                ...(isNumeric ? [{ productId: parseInt(search) }] : []),
                ...(barcodeMatchedIds.length > 0
                    ? [{ productId: { [Op.in]: barcodeMatchedIds } }]
                    : [])
            ];
            finalWhere = { [Op.or]: orConditions };
        }

        const totalCount = await Product.count({
            where: finalWhere,
            distinct: true
        });

        // Agar koi result nahi toh query mat karo
        if (totalCount === 0) {
            return res.json({
                data: [],
                total: 0,
                page: parseInt(page),
                pageSize: parseInt(pageSize)
            });
        }

        const products = await Product.findAll({
            where: finalWhere,
            attributes: [
                'productId', 'name', 'weight',
                'trackBatch', 'trackSerial', 'trackExpiry',
                [
                    sequelize.fn('COUNT',
                        sequelize.fn('DISTINCT',
                            sequelize.col('ProductVariants.productVariantId'))),
                    'TotalVariants'
                ]
            ],
            include: [{
                model: ProductVariant,
                attributes: [],
                required: false,
                duplicating: false
            }],
            group: [
                'Product.productId', 'Product.name', 'Product.description',
                'Product.weight', 'Product.trackBatch',
                'Product.trackSerial', 'Product.trackExpiry'
            ],
            order: [['productId', 'ASC']],
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            subQuery: false
        });

        res.json({
            data: products,
            total: totalCount,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        });

    } catch (error) {
        next(error);
    }
};

export const getVariants = async (req, res, next) => {
    try {
        const { search = '', page = 1, pageSize = 25 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(pageSize);
        const where = {};

        if (search) {
            where[Op.or] = [
                { variantId: { [Op.like]: `%${search}%` } },
                { color: { [Op.like]: `%${search}%` } },
                { size: { [Op.like]: `%${search}%` } }
            ];
        }

        // Count total separately since GROUP BY doesn't work well with findAndCountAll
        const totalCount = await ProductVariant.count({ where });

        const variants = await ProductVariant.findAll({
            where,
            attributes: [
                'productVariantId', 'variantId', 'color', 'size', 'price',
                [sequelize.fn('SUM', sequelize.col('InventoryLocations.quantityAvailable')), 'availableQuantity'],
                [sequelize.fn('SUM', sequelize.col('InventoryLocations.quantityReserved')), 'AllocatedQuantity']
            ],
            include: [{
                model: InventoryLocation,
                attributes: [],
                required: false,
                duplicating: false
            }],
            group: [
                'ProductVariant.productVariantId', 'ProductVariant.variantId',
                'ProductVariant.color', 'ProductVariant.size', 'ProductVariant.price'
            ],
            raw: true,
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            subQuery: false
        });
        res.json({ data: variants, total: totalCount, page: parseInt(page), pageSize: parseInt(pageSize) });
    } catch (error) {
        next(error);
    }
};

export const getBarcodes = async (req, res, next) => {
    try {
        const { search = '', page = 1, pageSize = 25 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(pageSize);
        const where = {};

        if (search) {
            where[Op.or] = [
                { barcode: { [Op.like]: `%${search}%` } },
                // Nested search: Variant ID ke zariye barcode dhoondne ke liye
                { '$ProductVariant.variantId$': { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: barcodes } = await ProductBarcode.findAndCountAll({
            where,
            attributes: ['barcode', 'isActive', 'createdAt'],
            include: [{
                model: ProductVariant,
                attributes: ['variantId']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            distinct: true
        });

        const mappedBarcodes = barcodes.map(b => ({
            barcode: b.barcode,
            variantId: b.ProductVariant ? b.ProductVariant.variantId : 'N/A',
            isActive: b.isActive,
            createdAt: b.createdAt
        }));

        res.json({ data: mappedBarcodes, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
    } catch (error) {
        next(error);
    }
};

export const bulkUpdateBarcodeStatus = async (req, res, next) => {
    try {
        const { barcodes, isActive } = req.body;

        if (!barcodes || !Array.isArray(barcodes) || barcodes.length === 0) {
            return res.status(400).json({ message: 'Barcodes array is required' });
        }

        if (isActive === undefined) {
            return res.status(400).json({ message: 'isActive status is required' });
        }

        await ProductBarcode.update({ isActive }, {
            where: {
                barcode: barcodes
            }
        });

        res.json({ message: `${barcodes.length} barcodes status updated successfully` });
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined' || isNaN(id)) {
            return res.status(400).json({ message: 'Invalid Product ID' });
        }

        const product = await Product.findByPk(id, {
            attributes: ['productId', 'name', 'description', 'category', 'weight', 'trackBatch', 'trackSerial', 'trackExpiry'],
            include: [{
                model: ProductVariant,
                attributes: ['productVariantId', 'variantId', 'color', 'size', 'price']
            }]
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
};

export const getProductFullDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined' || isNaN(id)) {
            return res.status(400).json({ message: 'Invalid Product ID' });
        }

        const product = await Product.findByPk(id, {
            attributes: ['productId', 'name', 'description', 'category', 'weight', 'trackBatch', 'trackSerial', 'trackExpiry'],
            include: [{
                model: ProductVariant,
                attributes: ['productVariantId', 'variantId', 'color', 'size', 'price', 'uoMId', 'variancePercentage'],
                include: [{
                    model: ProductBarcode,
                    attributes: ['barcode', 'isActive']
                }]
            }]
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const {
            name,
            description,
            category,
            weight,
            trackBatch,
            trackSerial,
            trackExpiry,
            variants // Array of { sku, color, size, price }
        } = req.body;

        const product = await Product.create({
            name,
            description,
            category,
            weight,
            trackBatch: !!trackBatch,
            trackSerial: !!trackSerial,
            trackExpiry: !!trackExpiry
        }, { transaction: t });
        if (variants && Array.isArray(variants) && variants.length > 0) {
            for (const v of variants) {
                const createdVariant = await ProductVariant.create({
                    productId: product.productId,
                    variantId: v.sku || v.variantId || `V-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    color: v.color,
                    size: v.size,
                    price: v.price || 0
                }, { transaction: t });
            }
        }
        await t.commit();
        res.status(201).json({
            message: 'Product and variants created successfully',
            productId: product.productId
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined' || isNaN(id)) {
            return res.status(400).json({ message: 'Invalid Product ID' });
        }

        const { name, description, category } = req.body;
        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (category !== undefined) product.category = category;

        await product.save();
        res.json({
            id: product.productId,
            sku: product.productId.toString(),
            name: product.name,
            description: product.description,
            category: product.category
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined' || isNaN(id)) {
            return res.status(400).json({ message: 'Invalid Product ID' });
        }

        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        await product.destroy();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const bulkDeleteProducts = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Invalid IDs' });

        await Product.destroy({
            where: {
                productId: ids
            }
        });

        res.json({ message: `${ids.length} products deleted successfully` });
    } catch (error) {
        next(error);
    }
};

export const bulkCreateProducts = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const productsToCreate = rows.map(row => ({
            name: (row.name || row.Name || '').toString().trim(),
            description: (row.description || row.Description || '').toString().trim(),
            category: (row.category || row.Category || '').toString().trim(),
            weight: parseFloat(row.weight || row.Weight || 0),
            trackBatch: row.trackBatch === true || row.trackBatch === 'true' || row.trackBatch === 1,
            trackSerial: row.trackSerial === true || row.trackSerial === 'true' || row.trackSerial === 1,
            trackExpiry: row.trackExpiry === true || row.trackExpiry === 'true' || row.trackExpiry === 1
        })).filter(p => p.name);

        if (productsToCreate.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'No valid products found in Excel' });
        }
        await Product.bulkCreate(productsToCreate);
        fs.unlinkSync(req.file.path);
        res.json({
            message: `${productsToCreate.length} products imported successfully`,
            total: productsToCreate.length
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        next(error);
    }
};

export const bulkCreateVariants = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const variantsToCreate = rows.map(row => ({
            productId: parseInt(row.productId || row.ProductId || row.product || row.Product || 0),
            variantId: (row.variantId || row.VariantId || row.sku || row.SKU || '').toString().trim(),
            color: (row.color || row.Color || '').toString().trim(),
            size: (row.size || row.Size || '').toString().trim(),
            price: parseFloat(row.price || row.Price || 0)
        })).filter(v => v.productId && v.variantId);

        if (variantsToCreate.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'No valid variants found in Excel' });
        }

        await ProductVariant.bulkCreate(variantsToCreate);
        fs.unlinkSync(req.file.path);
        res.json({
            message: `${variantsToCreate.length} variants imported successfully`,
            total: variantsToCreate.length
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        next(error);
    }
};

export const bulkCreateBarcodes = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const barcodesToCreate = rows.map(row => ({
            productVariantId: parseInt(row.productVariantId || row.ProductVariantId || row.variantId || row.VariantId || 0),
            barcode: (row.barcode || row.Barcode || '').toString().trim(),
            isActive: row.isActive === true || row.isActive === 'true' || row.isActive === 1
        })).filter(b => b.productVariantId && b.barcode);

        if (barcodesToCreate.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'No valid barcodes found in Excel' });
        }

        await ProductBarcode.bulkCreate(barcodesToCreate);
        fs.unlinkSync(req.file.path);
        res.json({
            message: `${barcodesToCreate.length} barcodes imported successfully`,
            total: barcodesToCreate.length
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        next(error);
    }
};

