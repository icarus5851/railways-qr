// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Package, CheckSquare, Truck, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
// ADD THIS LINE
import { API_BASE_URL } from '../config';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, installed: 0, inStorage: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/components`);
        const components = response.data;

        // Calculate stats
        const total = components.length;
        const installed = components.filter(c => c.status === 'Installed').length;
        const inStorage = total - installed;
        setStats({ total, installed, inStorage });

        // Aggregate data for the chart
        const counts = components.reduce((acc, curr) => {
          acc[curr.component_type] = (acc[curr.component_type] || 0) + 1;
          return acc;
        }, {});
        const formattedChartData = Object.keys(counts).map(key => ({
          name: key,
          count: counts[key],
        }));
        setChartData(formattedChartData);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const summaryData = [
    { icon: Package, value: stats.total, label: 'Total Components Tracked', color: 'bg-blue-100 text-blue-600' },
    { icon: CheckSquare, value: stats.installed, label: 'Components Installed', color: 'bg-green-100 text-green-600' },
    { icon: Truck, value: stats.inStorage, label: 'Components In Storage', color: 'bg-yellow-100 text-yellow-600' },
    { icon: AlertTriangle, value: '0', label: 'Active Alerts', color: 'bg-red-100 text-red-600' },
  ];

  if (loading) return <LoadingSpinner text="Loading Dashboard..." />;

  return (
    <div className="p-4 md:p-8">
      {/* --- THIS IS THE CHANGED LINE --- */}
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Live Inventory Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryData.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-md flex items-start">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${item.color}`}>
              <item.icon size={24} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">{item.value}</p>
              <p className="text-sm text-slate-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Component Inventory by Type</h2>
        <div className="overflow-x-auto">
          <div style={{ width: '100%', minWidth: '500px', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={50}
                />
                <YAxis stroke="#64748b" />
                <Tooltip cursor={{fill: '#f1f5f9'}}/>
                <Bar dataKey="count" fill="#3b82f6" barSize={40} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;