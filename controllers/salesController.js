const Sale = require('../models/Sale');
const SalesItem = require('../models/SalesItem');
const Stock = require('../models/Stock');

exports.createSale = async (req, res) => {
    try {
        const { customerName, mobileNumber, date, totalAmount, discount, finalAmount, items, paidAmount, balanceAmount, paymentMethod } = req.body;
        const userId = req.user._id;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Items are required' });
        }

        // Verify stock for all items first
        for (const item of items) {
            const stock = await Stock.findOne({ userId, flowerId: item.flowerId });
            if (!stock || stock.availableQuantity < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for flower ID ${item.flowerId}` });
            }
        }

        // Decrement stock
        for (const item of items) {
            const stock = await Stock.findOne({ userId, flowerId: item.flowerId });
            stock.availableQuantity -= item.quantity;
            stock.updatedDate = Date.now();
            await stock.save();
        }

        // Create Sale
        const sale = new Sale({
            userId,
            billNumber: 'BILL-' + Date.now().toString().slice(-6),
            customerName,
            totalAmount: finalAmount, // Use finalAmount from frontend as totalAmount for the schema
            paidAmount: paidAmount || 0,
            balanceAmount: balanceAmount || 0,
            paymentMethod: paymentMethod || 'Cash',
            date
        });
        await sale.save();

        // Create SalesItems
        const salesItems = items.map(item => ({
            userId,
            saleId: sale._id,
            flowerId: item.flowerId,
            quantity: item.quantity,
            sellingPrice: item.sellingPrice
        }));
        await SalesItem.insertMany(salesItems);

        res.status(201).json({ message: 'Sale created successfully', sale });
    } catch (error) {
        console.error('Error creating sale:', error);
        res.status(500).json({ error: error.stack || String(error) });
    }
};

exports.getSales = async (req, res) => {
    try {
        const sales = await Sale.find({ userId: req.user._id });
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sales' });
    }
};

exports.getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findOne({ _id: req.params.id, userId: req.user._id });
        if (!sale) return res.status(404).json({ error: 'Sale not found' });
        
        const items = await SalesItem.find({ saleId: sale._id }).populate('flowerId');
        res.status(200).json({ sale, items });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sale' });
    }
};

exports.deleteSale = async (req, res) => {
    try {
        const sale = await Sale.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!sale) return res.status(404).json({ error: 'Sale not found' });
        
        await SalesItem.deleteMany({ saleId: sale._id });
        res.status(200).json({ message: 'Sale deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete sale' });
    }
};
