export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

export const STATUS_STYLES = {
  New: {
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  Contacted: {
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    dot: 'bg-yellow-500',
  },
  Qualified: {
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
  },
  Converted: {
    badge: 'bg-green-100 text-green-700 border-green-200',
    dot: 'bg-green-500',
  },
  Lost: {
    badge: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
};

export const STATUS_ICONS = {
  New: '🆕',
  Contacted: '📞',
  Qualified: '✅',
  Converted: '🎉',
  Lost: '❌',
};
