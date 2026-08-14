const Stock = require('../models/Stock');

exports.create = async (req, res) => {
  try {
    const { flowerName, availableQuantity, unit, purchasePrice, sellingPrice, minimumStockLevel } = req.body;
    const userId = req.user._id;

    // Find or create flower
    const Flower = require('../models/Flower');
    let flower = await Flower.findOne({ userId, flowerName: { $regex: new RegExp(`^${flowerName}$`, 'i') } });
    if (!flower) {
        flower = new Flower({ userId, flowerName, unit, purchasePrice, sellingPrice });
        await flower.save();
    }
    const flowerId = flower._id;

    const item = await Stock.create({ 
      userId, 
      flowerId, 
      availableQuantity, 
      unit, 
      purchasePrice, 
      sellingPrice 
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const items = await Stock.find({ userId: req.user._id }).populate('flowerId');
    const formattedItems = items.map(item => {
      const obj = item.toObject();
      obj.flowerName = obj.flowerId ? obj.flowerId.flowerName : 'Unknown';
      obj.id = obj._id;
      return obj;
    });
    res.json(formattedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Stock.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Stock.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
