const Policy = require('../models/Policy');

// Get latest published version of a policy
exports.getLatestPublishedVersion = async (req, res) => {
  try {
    const { title } = req.params;
    const policy = await Policy.findOne({ title });

    if (!policy) return res.status(404).json({ message: 'Policy not found' });

    const latest = policy.versions
      .filter(v => v.status === 'published')
      .sort((a, b) => b.updatedAt - a.updatedAt)[0];

    res.json(latest || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get version history
exports.getVersionHistory = async (req, res) => {
  try {
    const { title } = req.params;
    const policy = await Policy.findOne({ title });

    if (!policy) return res.status(404).json({ message: 'Policy not found' });

    res.json(policy.versions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add new version (published or draft)
exports.addNewVersion = async (req, res) => {
  try {
    const { title } = req.params;
    const { content, status } = req.body;

    const policy = await Policy.findOneAndUpdate(
      { title },
      { $push: { versions: { content, status } } },
      { new: true, upsert: true }
    );

    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
