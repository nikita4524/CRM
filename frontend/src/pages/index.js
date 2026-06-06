import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import { Plus, Search, Filter, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { leadsApi } from '@/lib/api';
import { LEAD_STATUSES } from '@/lib/constants';
import StatsCard from '@/components/StatsCard';
import LeadTable from '@/components/LeadTable';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import LeadForm from '@/components/LeadForm';
import ConfirmDialog from '@/components/ConfirmDialog';

const DEFAULT_PARAMS = {
  search: '',
  status: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 10,
};

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 });
  const [stats, setStats] = useState(null);
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [deleteLead, setDeleteLead] = useState(null);

  const searchTimer = useRef(null);

  // Fetch leads
  const fetchLeads = useCallback(async (queryParams) => {
    setIsLoading(true);
    try {
      const { data } = await leadsApi.getAll(queryParams);
      setLeads(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await leadsApi.getStats();
      setStats(data.data);
    } catch {
      // stats are non-critical
    }
  }, []);

  useEffect(() => {
    fetchLeads(params);
  }, [params, fetchLeads]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Debounced search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: value, page: 1 }));
    }, 400);
  };

  const clearSearch = () => {
    setSearchInput('');
    setParams((prev) => ({ ...prev, search: '', page: 1 }));
  };

  const handleStatusFilter = (e) => {
    setParams((prev) => ({ ...prev, status: e.target.value, page: 1 }));
  };

  const handleSort = (sortBy, sortOrder) => {
    setParams((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  const handlePageChange = (page) => {
    setParams((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CRUD handlers
  const handleCreate = async (formData) => {
    setIsMutating(true);
    try {
      await leadsApi.create(formData);
      toast.success('Lead added successfully');
      setShowAddModal(false);
      setParams({ ...DEFAULT_PARAMS });
      setSearchInput('');
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdate = async (formData) => {
    setIsMutating(true);
    try {
      await leadsApi.update(editLead._id, formData);
      toast.success('Lead updated successfully');
      setEditLead(null);
      fetchLeads(params);
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update lead');
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    setIsMutating(true);
    try {
      await leadsApi.delete(deleteLead._id);
      toast.success('Lead deleted');
      setDeleteLead(null);
      // If we deleted the last item on a page > 1, go back
      const newPage = leads.length === 1 && params.page > 1 ? params.page - 1 : params.page;
      setParams((prev) => ({ ...prev, page: newPage }));
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete lead');
    } finally {
      setIsMutating(false);
    }
  };

  const hasFilters = params.search || params.status;

  return (
    <>
      <Head>
        <title>Lead CRM — Dashboard</title>
        <meta name="description" content="Manage your sales leads efficiently" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Top Nav */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🎯</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">LeadCRM</span>
            </div>
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              <Plus size={16} />
              <span className="hidden sm:inline">Add Lead</span>
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          {stats && (
            <section aria-label="Statistics" className="mb-8">
              <h2 className="text-base font-semibold text-gray-700 mb-3">Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatsCard
                  label="Total Leads"
                  value={stats.total}
                  icon="👥"
                  colorClass="text-gray-800"
                  bgClass="bg-gray-100"
                />
                <StatsCard
                  label="New"
                  value={stats.byStatus.New}
                  icon="🆕"
                  colorClass="text-blue-700"
                  bgClass="bg-blue-50"
                />
                <StatsCard
                  label="Contacted"
                  value={stats.byStatus.Contacted}
                  icon="📞"
                  colorClass="text-yellow-700"
                  bgClass="bg-yellow-50"
                />
                <StatsCard
                  label="Qualified"
                  value={stats.byStatus.Qualified}
                  icon="✅"
                  colorClass="text-purple-700"
                  bgClass="bg-purple-50"
                />
                <StatsCard
                  label="Converted"
                  value={stats.byStatus.Converted}
                  icon="🎉"
                  colorClass="text-green-700"
                  bgClass="bg-green-50"
                />
                <StatsCard
                  label="Conversion Rate"
                  value={`${stats.conversionRate}%`}
                  icon="📈"
                  colorClass="text-emerald-700"
                  bgClass="bg-emerald-50"
                />
              </div>
            </section>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search by name, email or company..."
                className="input pl-9 pr-9"
                aria-label="Search leads"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-gray-400 flex-shrink-0" />
              <select
                value={params.status}
                onChange={handleStatusFilter}
                className="input w-auto"
                aria-label="Filter by status"
              >
                <option value="">All Statuses</option>
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={() => fetchLeads(params)}
              className="btn-secondary px-3"
              aria-label="Refresh"
              disabled={isLoading}
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setParams({ ...DEFAULT_PARAMS });
                }}
                className="btn-secondary text-red-500 hover:text-red-600"
              >
                <X size={15} />
                Clear
              </button>
            )}
          </div>

          {/* Results summary */}
          <p className="text-sm text-gray-500 mb-2">
            {!isLoading && (
              <>
                {pagination.total} lead{pagination.total !== 1 ? 's' : ''}
                {params.search && <> matching "<span className="font-medium">{params.search}</span>"</>}
                {params.status && <> with status <span className="font-medium">{params.status}</span></>}
              </>
            )}
          </p>

          {/* Table */}
          <LeadTable
            leads={leads}
            sortBy={params.sortBy}
            sortOrder={params.sortOrder}
            onSort={handleSort}
            onEdit={setEditLead}
            onDelete={setDeleteLead}
            isLoading={isLoading}
          />

          {/* Pagination */}
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
          />
        </main>
      </div>

      {/* Add Lead Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Lead" size="lg">
        <LeadForm
          onSubmit={handleCreate}
          onCancel={() => setShowAddModal(false)}
          isLoading={isMutating}
        />
      </Modal>

      {/* Edit Lead Modal */}
      <Modal isOpen={!!editLead} onClose={() => setEditLead(null)} title="Edit Lead" size="lg">
        <LeadForm
          initialData={editLead}
          onSubmit={handleUpdate}
          onCancel={() => setEditLead(null)}
          isLoading={isMutating}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteLead}
        onClose={() => setDeleteLead(null)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete "${deleteLead?.name}"? This action cannot be undone.`}
        isLoading={isMutating}
      />
    </>
  );
}
