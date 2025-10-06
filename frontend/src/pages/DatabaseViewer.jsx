// src/pages/DatabaseViewer.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PlusCircle, Trash2, ChevronsUpDown, ChevronUp, ChevronDown, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
// ADD THIS LINE
import { API_BASE_URL } from '../config';

const ITEMS_PER_PAGE = 10;

const DatabaseViewer = () => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'component_id', direction: 'ascending' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchComponents = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/components`);
            setComponents(response.data);
        } catch (err) {
            console.error("Failed to fetch components:", err);
            toast.error("Could not fetch data from backend.");
        } finally {
            setLoading(false);
        }
    };
    fetchComponents();
  }, []);

  const processedComponents = useMemo(() => {
    let filteredItems = [...components].filter(item =>
      (item.component_id?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (item.component_type?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (item.vendor_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    if (sortConfig.key !== null) {
        filteredItems.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }
    return filteredItems;
  }, [components, sortConfig, searchQuery]);

  const totalPages = Math.ceil(processedComponents.length / ITEMS_PER_PAGE);
  const paginatedComponents = processedComponents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (name) => {
    if (sortConfig.key !== name) return <ChevronsUpDown size={14} className="ml-2 text-slate-400" />;
    if (sortConfig.direction === 'ascending') return <ChevronUp size={14} className="ml-2" />;
    return <ChevronDown size={14} className="ml-2" />;
  };

  const handleDelete = async (componentId) => {
    if (!window.confirm(`Are you sure you want to delete component ${componentId}?`)) return;
    try {
        await axios.delete(`${API_BASE_URL}/components/delete/${componentId}`);
        toast.success(`Component ${componentId} deleted successfully.`);
        setComponents(prevComponents => prevComponents.filter(c => c.component_id !== componentId));
    } catch (error) {
        toast.error(`Failed to delete component ${componentId}.`);
        console.error(error);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Database..." />;

  return (
    <div className="p-4 md:p-8">
      <Toaster position="top-center" />
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Component Database</h1>
        <Link to="/add-component" className="btn-primary">
          <PlusCircle size={16} /> Add New Component
        </Link>
      </div>
      
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search by ID, Type, or Vendor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input w-full pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
      </div>

      {/* --- Mobile Card View (hidden on medium screens and up) --- */}
      <div className="space-y-4 md:hidden">
        {paginatedComponents.map(item => (
          <div key={item.component_id} className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
            <div className="flex justify-between items-start border-b pb-3 mb-3">
              <div>
                <p className="text-xs uppercase text-slate-500">Component ID</p>
                <Link to={`/component/${item.component_id}`} className="font-mono text-sm text-blue-600 font-semibold">{item.component_id}</Link>
              </div>
              <button onClick={() => handleDelete(item.component_id)} className="text-slate-400 hover:text-red-600 p-1" title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Type</span> <span className="font-semibold text-slate-800">{item.component_type}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Vendor</span> <span className="font-semibold text-slate-800">{item.vendor_name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Batch No.</span> <span className="font-mono text-xs text-slate-800">{item.batch_no}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-500">Status</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ item.status === 'Installed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Desktop Table View (hidden by default, visible on medium screens and up) --- */}
      <div className="hidden md:block bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-sm text-slate-600">
            <tr>
              <th className="p-0"><button onClick={() => requestSort('component_id')} className="flex items-center w-full p-4 font-semibold">Component ID {getSortIcon('component_id')}</button></th>
              <th className="p-0"><button onClick={() => requestSort('component_type')} className="flex items-center w-full p-4 font-semibold">Type {getSortIcon('component_type')}</button></th>
              <th className="p-0"><button onClick={() => requestSort('vendor_name')} className="flex items-center w-full p-4 font-semibold">Vendor {getSortIcon('vendor_name')}</button></th>
              <th className="p-4">Batch No.</th>
              <th className="p-0"><button onClick={() => requestSort('status')} className="flex items-center w-full p-4 font-semibold">Status {getSortIcon('status')}</button></th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedComponents.map(item => (
              <tr key={item.component_id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                <td className="p-4 font-mono text-sm text-blue-600"><Link to={`/component/${item.component_id}`}>{item.component_id}</Link></td>
                <td className="p-4 font-semibold">{item.component_type}</td>
                <td className="p-4 font-semibold">{item.vendor_name}</td>
                <td className="p-4 font-mono text-xs">{item.batch_no}</td>
                <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${ item.status === 'Installed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{item.status}</span></td>
                <td className="p-4"><button onClick={() => handleDelete(item.component_id)} className="text-slate-500 hover:text-red-600 p-1" title="Delete Component"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Pagination Controls --- */}
      <div className="flex justify-between items-center mt-6">
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="btn-secondary disabled:opacity-50">
          Previous
        </button>
        <span className="text-sm font-semibold text-slate-600">
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="btn-secondary disabled:opacity-50">
          Next
        </button>
      </div>
    </div>
  );
};

export default DatabaseViewer;