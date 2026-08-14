const Purchase = require('../models/Purchase');
const Stock = require('../models/Stock');
const Wholesaler = require('../models/Wholesaler');

exports.createPurchase = async (req, res) => {
    try {
        const { flowerName, wholesalerId, quantity, unit, purchasePrice, sellingPrice, totalAmount, paidAmount, pendingAmount, date } = req.body;
        const userId = req.user._id;

        // Find or create flower
        const Flower = require('../models/Flower');
        let flower = await Flower.findOne({ userId, flowerName: { $regex: new RegExp(`^${flowerName}$`, 'i') } });
        if (!flower) {
            flower = new Flower({ userId, flowerName, unit, purchasePrice, sellingPrice: sellingPrice || purchasePrice * 1.5 });
            await flower.save();
        }
        const flowerId = flower._id;

        const purchase = new Purchase({
            userId,
            flowerId,
            wholesalerId,
            quantity,
            purchasePrice,
            totalAmount,
            paidAmount: paidAmount || 0,
            pendingAmount: pendingAmount || totalAmount - (paidAmount || 0),
            date
        });
        await purchase.save();

        let stock = await Stock.findOne({ userId, flowerId });
        if (stock) {
            stock.availableQuantity += Number(quantity);
            stock.unit = unit;
            stock.purchasePrice = purchasePrice;
            stock.sellingPrice = sellingPrice;
            stock.updatedDate = Date.now();
            await stock.save();
        } else {
            stock = new Stock({
                userId,
                flowerId,
                availableQuantity: quantity,
                unit,
                purchasePrice,
                sellingPrice,
                updatedDate: Date.now()
            });
            await stock.save();
        }

        const wholesaler = await Wholesaler.findOne({ _id: wholesalerId, userId });
        if (wholesaler) {
            wholesaler.totalPurchase = (wholesaler.totalPurchase || 0) + Number(totalAmount);
            wholesaler.pendingAmount = (wholesaler.pendingAmount || 0) + Number(totalAmount);
            await wholesaler.save();
        }

        res.status(201).json({ message: 'Purchase created successfully', purchase });
    } catch (error) {
        console.error('Error creating purchase:', error);
        res.status(500).json({ error: 'Failed to create purchase' });
    }
};

exports.getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find({ userId: req.user._id }).populate('flowerId wholesalerId');
        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch purchases' });
    }
};

exports.getPurchaseById = async (req, res) => {
    try {
        const purchase = await Purchase.findOne({ _id: req.params.id, userId: req.user._id }).populate('flowerId wholesalerId');
        if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
        res.status(200).json(purchase);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch purchase' });
    }
};

exports.deletePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
        res.status(200).json({ message: 'Purchase deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete purchase' });
    }
};
