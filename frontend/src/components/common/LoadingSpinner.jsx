// src/components/common/LoadingSpinner.jsx
import React from 'react';
import { LoaderCircle } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-slate-500">
      <LoaderCircle className="animate-spin" size={48} />
      <p className="mt-4 font-semibold">{text}</p>
    </div>
  );
};

export default LoadingSpinner;