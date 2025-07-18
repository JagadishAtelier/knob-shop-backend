const Ad = require('../models/Ad');

exports.createAd = async (req, res) => {
  try {
    const {
      adMode,
      title,
      description,
      adType,
      image,
      category,
      link,
      fromDate,
      toDate,
      ctaButton
    } = req.body;

    if (!["single", "multiple"].includes(adMode)) {
      return res.status(400).json({ message: "Invalid adMode: should be 'single' or 'multiple'" });
    }

    const titles = Array.isArray(title) ? title : [title];
    const descriptions = Array.isArray(description) ? description : [description];
    const adTypes = Array.isArray(adType) ? adType : [adType];
    const images = Array.isArray(image) ? image : [image];
    const categories = Array.isArray(category) ? category : [category];
    const links = Array.isArray(link) ? link : [link];
    const fromDates = Array.isArray(fromDate) ? fromDate : [fromDate];
    const toDates = Array.isArray(toDate) ? toDate : [toDate];
    const ctaButtons = Array.isArray(ctaButton) ? ctaButton : [ctaButton];

    const count = titles.length;
    if (
      descriptions.length !== count ||
      adTypes.length !== count ||
      images.length !== count ||
      categories.length !== count
    ) {
      return res.status(400).json({ message: "All ad arrays must be the same length" });
    }

    if (adMode === "single" && count > 1) {
      return res.status(400).json({ message: "Only one ad allowed when adMode is 'single'" });
    }

    const ads = [];

    for (let i = 0; i < count; i++) {
      ads.push({
        adMode,
        title: titles[i],
        description: descriptions[i],
        adType: adTypes[i] || 'banner',
        image: images[i],
        category: categories[i] || 'home page',
        link: links[i] || '',
        fromDate: fromDates[i] || null,
        toDate: toDates[i] || null,
        ctaButton: ctaButtons[i] || '',
      });
    }

    const savedAds = await Ad.insertMany(ads);
    res.status(201).json({ message: "Ads created successfully", ads: savedAds });
  } catch (error) {
    console.error("Error creating ads:", error);
    res.status(500).json({ message: "Failed to create ad(s)", error });
  }
};

exports.getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.status(200).json({ message: "All ads fetched", ads });
  } catch (error) {
    res.status(500).json({ message: "Error fetching ads", error });
  }
};

exports.deleteAd = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedAd = await Ad.findByIdAndDelete(id);
      if (!deletedAd) {
        return res.status(404).json({ message: "Ad not found" });
      }
      res.status(200).json({ message: "Ad deleted successfully", ad: deletedAd });
    } catch (error) {
      res.status(500).json({ message: "Error deleting ad", error });
    }
  };
  exports.getAdById = async (req, res) => {
    try {
      const ad = await Ad.findById(req.params.id);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }
      res.status(200).json({ message: "Ad fetched successfully", ad });
    } catch (error) {
      res.status(500).json({ message: "Error fetching ad", error });
    }
  };