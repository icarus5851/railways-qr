// src/pages/AddComponentPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Download, Loader, RefreshCw, Trash2, FileCode } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8000/api';

const downloadFile = (content, fileName) => {
  const blob = new Blob([content], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const AddComponentPage = () => {
  const [formData, setFormData] = useState({
    component_type: '',
    material: '',
    vendor_name: '',
    batch_no: '',
    manufacturing_date: '',
    warranty_years: '10',
    installation_date: '',
    track_section_id: '',
    location_lat: '',
    location_lon: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGeneratedData(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/components/add`, formData);
      setGeneratedData(response.data);
      toast.success('Component created and saved to database!');
    } catch (error) {
      toast.error('Failed to create component.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemove = async () => {
    if (!generatedData) return;
    const { component_id } = generatedData.component;
    const toastId = toast.loading('Removing from database...');
    try {
      await axios.delete(`${API_BASE_URL}/components/delete/${component_id}`);
      toast.success('Component removed successfully!', { id: toastId });
      handleReset();
    } catch (error) {
      toast.error('Failed to remove component.', { id: toastId });
      console.error(error);
    }
  };

  const handleReset = () => {
    setGeneratedData(null);
    setFormData({
      component_type: '', material: '', vendor_name: '', batch_no: '',
      manufacturing_date: '', warranty_years: '10', installation_date: '',
      track_section_id: '', location_lat: '', location_lon: '',
    });
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-full">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <PlusCircle className="text-slate-700" size={32} />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Add New Component</h1>
        </div>
        
        {!generatedData ? (
          <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-lg space-y-8">
            {/* Core Details */}
            <fieldset>
              <legend className="text-lg text-slate-700 col-span-full font-bold underline pb-2 mb-4">Core Details</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="component_type" className="label">Component Type</label>
                  <input type="text" id="component_type" name="component_type" value={formData.component_type} onChange={handleChange} required className="input px-3"/>
                </div>
                <div>
                  <label htmlFor="material" className="label">Material</label>
                  <input type="text" id="material" name="material" value={formData.material} onChange={handleChange} required className="input px-3"/>
                </div>
                <div>
                  <label htmlFor="vendor_name" className="label">Vendor Name</label>
                  <input type="text" id="vendor_name" name="vendor_name" value={formData.vendor_name} onChange={handleChange} required className="input px-3"/>
                </div>
                <div>
                  <label htmlFor="batch_no" className="label">Batch No.</label>
                  <input type="text" id="batch_no" name="batch_no" value={formData.batch_no} onChange={handleChange} required className="input px-3"/>
                </div>
                <div>
                  <label htmlFor="manufacturing_date" className="label">Manufacturing Date</label>
                  <input type="date" id="manufacturing_date" name="manufacturing_date" value={formData.manufacturing_date} onChange={handleChange} required className="input px-3"/>
                </div>
                <div>
                  <label htmlFor="warranty_years" className="label">Warranty (Years)</label>
                  <input type="number" id="warranty_years" name="warranty_years" value={formData.warranty_years} onChange={handleChange} required className="input px-3"/>
                </div>
              </div>
            </fieldset>

            {/* Installation Details (Optional) */}
            <fieldset>
              <legend className="text-lg font-bold underline text-slate-700 col-span-full pb-2 mb-4">Installation Details (Optional)</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="installation_date" className="label">Installation Date</label>
                  <input type="date" id="installation_date" name="installation_date" value={formData.installation_date} onChange={handleChange} className="input px-3"/>
                </div>
                <div>
                  <label htmlFor="track_section_id" className="label">Track Section ID</label>
                  <input type="text" id="track_section_id" name="track_section_id" placeholder="e.g., MUM-SUR-UP-KM254" value={formData.track_section_id} onChange={handleChange} className="input px-3"/>
                </div>
                <div>
                  <label htmlFor="location_lat" className="label">Location (Latitude)</label>
                  <input type="text" id="location_lat" name="location_lat" placeholder="e.g., 21.1702" value={formData.location_lat} onChange={handleChange} className="input px-3"/>
                </div>
                <div>
                  <label htmlFor="location_lon" className="label">Location (Longitude)</label>
                  <input type="text" id="location_lon" name="location_lon" placeholder="e.g., 72.8777" value={formData.location_lon} onChange={handleChange} className="input px-3"/>
                </div>
              </div>
            </fieldset>
            
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-3">
              {isSubmitting ? <Loader className="animate-spin" /> : <PlusCircle />}
              {isSubmitting ? 'Saving...' : 'Generate & Save Component'}
            </button>
          </form>
        ) : (
          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg shadow-md space-y-6">
            <div>
              <h2 className="text-xl font-bold text-green-800">Component Created Successfully</h2>
              <p className="font-mono text-sm bg-green-100 text-green-900 p-2 rounded mt-2 break-all">{generatedData.component.component_id}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="text-center bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-slate-600 mb-2">QR Code Preview (SVG)</h3>
                  <div className="p-2 border rounded-lg bg-slate-50">
                      <img src={`data:image/svg+xml;utf8,${encodeURIComponent(generatedData.svg_content)}`} alt="Generated QR Code" className="w-full h-auto"/>
                  </div>
                  <button onClick={() => downloadFile(generatedData.svg_content, `qr_${generatedData.component.component_id}.svg`)} className="mt-3 btn-secondary">
                      <Download size={16}/> Download SVG
                  </button>
              </div>
              <div className="text-center bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-slate-600 mb-2">Laser File (DXF)</h3>
                  <div className="p-2 border rounded-lg flex flex-col items-center justify-center h-full bg-slate-50 min-h-[160px]">
                      <FileCode size={48} className="text-slate-400 mb-2"/>
                      <p className="text-xs text-slate-500">DXF file is ready for download.</p>
                  </div>
                  <button onClick={() => downloadFile(generatedData.dxf_content, `qr_${generatedData.component.component_id}.dxf`)} className="mt-3 btn-secondary">
                      <Download size={16}/> Download DXF
                  </button>
              </div>
            </div>
            
            <div className="flex gap-4 pt-6 border-t">
                <button onClick={handleReset} className="w-full btn-secondary">
                    <RefreshCw size={16}/> Add Another
                </button>
                <button onClick={handleRemove} className="w-full flex justify-center items-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                    <Trash2 size={16}/> Remove
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddComponentPage;