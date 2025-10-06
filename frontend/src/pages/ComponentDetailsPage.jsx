// src/pages/ComponentDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FileText, Bot, AlertTriangle, Server, ClipboardList } from 'lucide-react';
// ADD THIS LINE
import { API_BASE_URL } from '../config';

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-3 border-b border-slate-200">
    <span className="font-semibold text-slate-500">{label}:</span>
    <span className="text-slate-800 text-right">{value || 'N/A'}</span>
  </div>
);

// --- NEW: A dedicated component to format the location details ---
const LocationValue = ({ component }) => {
  if (!component.track_section_id && !component.location) {
    return 'In Storage';
  }

  const trackId = component.track_section_id || 'Not specified';
  const coords = component.location?.coordinates;

  return (
    <div className="text-right">
      <div>{trackId}</div>
      {coords && (
        <div className="text-xs text-slate-500">
          [{coords[0]}, {coords[1]}]
        </div>
      )}
    </div>
  );
};

const ComponentDetailsPage = () => {
  const { componentId } = useParams();
  const [component, setComponent] = useState(null);
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComponent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/components/${componentId}`);
        setComponent(response.data);
      } catch (err) {
        setError("Failed to fetch component data. The component might not exist or the backend is down.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchComponent();
  }, [componentId]);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/report/generate`, {
        component_id: componentId,
      });
      setReport(response.data.report_text);
    } catch (err) {
      setError("Failed to generate AI report.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center font-semibold">Loading Component Data...</div>;
  if (error && !component) return <div className="p-8 text-center text-red-500 font-semibold">{error}</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="text-slate-700" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Component Details</h1>
          <p className="text-slate-500 font-mono text-sm">{componentId}</p>
        </div>
      </div>

      {/* Component Data Section */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">Component Information</h2>
        <div className="space-y-2">
          <DetailRow label="Component Type" value={component.component_type} />
          <DetailRow label="Material" value={component.material} />
          <DetailRow label="Vendor" value={component.vendor_name} />
          <DetailRow label="Batch No." value={component.batch_no} />
          <DetailRow
            label="Manufacturing Date"
            value={component.manufacturing_date ? new Date(component.manufacturing_date).toLocaleDateString('en-GB') : 'N/A'}
          />
          <DetailRow
            label="Expiry Date"
            value={component.expiry_date ? new Date(component.expiry_date).toLocaleDateString('en-GB') : 'N/A'}
          />
          {/* --- UPDATED: Use the new LocationValue component --- */}
          <DetailRow label="Location" value={<LocationValue component={component} />} />
          <DetailRow label="Status" value={component.status} />
        </div>
      </div>

      {/* AI Report Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        {!report && !isGeneratingReport && (
          <div className="text-center">
            <Bot size={40} className="mx-auto text-slate-400 mb-4" />
            <h2 className="text-xl font-bold text-slate-700">AI-Powered Report</h2>
            <p className="text-slate-500 my-2">Generate a detailed analysis and maintenance recommendations.</p>
            <button
              onClick={handleGenerateReport}
              className="mt-4 bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Report
            </button>
          </div>
        )}

        {isGeneratingReport && (
          <div className="text-center text-slate-500">
            <Bot className="animate-pulse mx-auto" size={40} />
            <p className="mt-4 font-semibold">AI is analyzing the data...</p>
          </div>
        )}

        {error && report === '' && (
          <div className="text-center text-red-500 font-semibold p-4 bg-red-50 rounded-lg flex flex-col items-center gap-2">
            <AlertTriangle /> {error}
          </div>
        )}

        {report && (
          <div className="prose max-w-none break-words">
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentDetailsPage;
