// src/pages/ScanPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import toast, { Toaster } from 'react-hot-toast';
import { Camera, Upload, XCircle, QrCode } from 'lucide-react';

const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 } };

const ScanPage = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  const qrcodeRegionId = "reader";

  useEffect(() => {
    // This effect handles the camera logic when `isScanning` changes.
    if (!isScanning) return;

    const html5QrCode = new Html5Qrcode(qrcodeRegionId);
    const onScanSuccess = (decodedText) => {
      setIsScanning(false);
      // Navigate to the details page on successful scan
      navigate(`/component/${decodedText}`);
    };

    html5QrCode.start({ facingMode: 'environment' }, qrConfig, onScanSuccess, () => {})
      .catch((err) => {
        toast.error("Could not start camera. Please check permissions.");
        setIsScanning(false);
      });

    // Cleanup function to stop the camera
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error("Failed to stop scanner cleanly.", err));
      }
    };
  }, [isScanning, navigate]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(false); // Ensure camera is off
    const toastId = toast.loading('Scanning image...');
    try {
      const decodedText = await new Html5Qrcode(qrcodeRegionId).scanFile(file, false);
      toast.success('Code found!', { id: toastId });
      // Navigate to the details page on successful upload scan
      navigate(`/component/${decodedText}`);
    } catch (err) {
      toast.error('Could not decode QR code from image.', { id: toastId });
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <Toaster position="top-center" />
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6 text-center">Scan Component Code</h1>
      
      
      {/* Centered Main Scanning Container */}
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg flex flex-col items-center justify-center min-h-[400px]">
          
          {/* The reader div is always present for the library to mount to */}
          <div id={qrcodeRegionId} className={`${!isScanning ? 'hidden' : ''} w-full max-w-md rounded-lg overflow-hidden`}></div>

          {isScanning ? (
            // --- Scanning State ---
            <>
              <p className="text-slate-500 mt-4">Place a QR or DataMatrix code inside the frame.</p>
              <div className='flex items-center justify-center'>
                <button
                onClick={() => setIsScanning(false)}
                className="mt-4 flex items-center gap-2 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                <XCircle size={20} /> Stop Scanning
              </button>
              </div>
            </>
          ) : (
            // --- Idle State ---
            <div className="text-center">
              <QrCode className="mx-auto text-slate-300 mb-4" size={80} strokeWidth={1} />
              <h2 className="text-xl font-semibold text-slate-700">Ready to Scan</h2>
              <p className="text-slate-500 my-4">Start the camera to begin a live scan or upload an image file.</p>
              <div className="flex flex-col items-center justify-center sm:flex-row gap-4">
                <button
                  onClick={() => setIsScanning(true)}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera size={20} /> Start Camera
                </button>
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center justify-center gap-2 bg-slate-200 text-slate-800 font-semibold py-3 px-6 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  <Upload size={20} /> Upload Image
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanPage;