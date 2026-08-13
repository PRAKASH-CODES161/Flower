const Payment = require('../models/Payment');
const Wholesaler = require('../models/Wholesaler');

exports.createPayment = async (req, res) => {
    try {
        const { wholesalerId, amount, date, paymentMode, referenceNumber } = req.body;
        const userId = req.user._id;

        const payment = new Payment({
            userId,
            wholesalerId,
            amount,
            date,
            paymentMode,
            referenceNumber
        });
        await payment.save();

        const wholesaler = await Wholesaler.findOne({ _id: wholesalerId, userId });
        if (wholesaler) {
            wholesaler.paidAmount = (wholesaler.paidAmount || 0) + Number(amount);
            wholesaler.pendingAmount = (wholesaler.pendingAmount || 0) - Number(amount);
            await wholesaler.save();
        }

        res.status(201).json({ message: 'Payment recorded successfully', payment });
    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({ error: 'Failed to record payment' });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user._id }).populate('wholesalerId');
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
};

exports.getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findOne({ _id: req.params.id, userId: req.user._id }).populate('wholesalerId');
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch payment' });
    }
};

exports.deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete payment' });
    }
};
