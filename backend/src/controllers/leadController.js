const Lead = require('../models/Lead');
const { LEAD_STATUSES } = require('../models/Lead');

// Helper to build sort object
const buildSort = (sortBy = 'createdAt', sortOrder = 'desc') => {
  const allowedFields = ['name', 'email', 'company', 'status', 'createdAt', 'updatedAt'];
  const field = allowedFields.includes(sortBy) ? sortBy : 'createdAt';
  const order = sortOrder === 'asc' ? 1 : -1;
  return { [field]: order };
};

// @desc    Create a new lead
// @route   POST /api/leads
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, company, status, notes } = req.body;

    const lead = await Lead.create({ name, email, phone, company, status, notes });

    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A lead with this email already exists',
      });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all leads with search, filter, sort, pagination
// @route   GET /api/leads
exports.getLeads = async (req, res) => {
  try {
    const {
      search = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Text search across name, email, company
    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { company: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Status filter
    if (status && LEAD_STATUSES.includes(status)) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [leads, total] = await Promise.all([
      Lead.find(filter).sort(buildSort(sortBy, sortOrder)).skip(skip).limit(limitNum),
      Lead.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, data: lead });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid lead ID' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
exports.updateLead = async (req, res) => {
  try {
    const { name, email, phone, company, status, notes } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, company, status, notes },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({ success: true, data: lead });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid lead ID' });
    }
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A lead with this email already exists',
      });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid lead ID' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get lead statistics
// @route   GET /api/leads/stats
exports.getStats = async (req, res) => {
  try {
    const [statusBreakdown, totalLeads, recentLeads] = await Promise.all([
      Lead.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Lead.countDocuments(),
      // Leads created in the last 30 days
      Lead.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    // Build status map with zeroes for missing statuses
    const statusMap = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0]));
    statusBreakdown.forEach(({ _id, count }) => {
      statusMap[_id] = count;
    });

    const conversionRate =
      totalLeads > 0
        ? ((statusMap['Converted'] / totalLeads) * 100).toFixed(1)
        : 0;

    res.json({
      success: true,
      data: {
        total: totalLeads,
        recentLeads,
        conversionRate: parseFloat(conversionRate),
        byStatus: statusMap,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
