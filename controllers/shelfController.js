const Shelf = require("../models/shelfModel");

// Create Shelf
exports.createShelf = async (req, res) => {
    try {
        const { heading, content, imageUrl } = req.body;

        const newShelf = new Shelf({ heading, content, imageUrl });
        await newShelf.save();

        res.status(201).json({ success: true, data: newShelf });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Get All Shelves
exports.getShelves = async (req, res) => {
    try {
        const shelves = await Shelf.find();
        res.json({ success: true, data: shelves });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get Single Shelf
exports.getShelfById = async (req, res) => {
    try {
        const shelf = await Shelf.findById(req.params.id);
        if (!shelf) return res.status(404).json({ success: false, error: "Shelf not found" });

        res.json({ success: true, data: shelf });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Update Shelf
exports.updateShelf = async (req, res) => {
    try {
        const updatedShelf = await Shelf.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedShelf) return res.status(404).json({ success: false, error: "Shelf not found" });

        res.json({ success: true, data: updatedShelf });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Delete Shelf
exports.deleteShelf = async (req, res) => {
    try {
        const deletedShelf = await Shelf.findByIdAndDelete(req.params.id);
        if (!deletedShelf) return res.status(404).json({ success: false, error: "Shelf not found" });

        res.json({ success: true, message: "Shelf deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
