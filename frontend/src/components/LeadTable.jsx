import { Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import StatusBadge from './StatusBadge';

function SortIcon({ field, sortBy, sortOrder }) {
  if (sortBy !== field) return <ChevronsUpDown size={14} className="text-gray-400" />;
  return sortOrder === 'asc'
    ? <ChevronUp size={14} className="text-blue-500" />
    : <ChevronDown size={14} className="text-blue-500" />;
}

const COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'phone', label: 'Phone', sortable: false },
  { key: 'company', label: 'Company', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'createdAt', label: 'Created', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
];

export default function LeadTable({ leads, sortBy, sortOrder, onSort, onEdit, onDelete, isLoading }) {
  const handleSort = (key) => {
    if (!COLUMNS.find((c) => c.key === key)?.sortable) return;
    if (sortBy === key) {
      onSort(key, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  if (isLoading) {
    return (
      <div className="card overflow-hidden">
        <div className="p-8 text-center text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading leads...
        </div>
      </div>
    );
  }

  if (!leads.length) {
    return (
      <div className="card overflow-hidden">
        <div className="p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium text-gray-500">No leads found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap
                    ${col.sortable ? 'cursor-pointer select-none hover:text-gray-700' : ''}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon field={col.key} sortBy={sortBy} sortOrder={sortOrder} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads.map((lead) => (
              <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{lead.name}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  <a href={`mailto:${lead.email}`} className="hover:text-blue-600 hover:underline">
                    {lead.email}
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{lead.phone}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{lead.company}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(lead.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(lead)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      aria-label={`Edit ${lead.name}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(lead)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label={`Delete ${lead.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
