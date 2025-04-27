'use client';

import React from 'react';

const DownloadButton = () => {
  const handleDownload = async () => {
    try {
      // Attempt direct download first
      window.location.href = '/api/download';
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleDirectDownload = () => {
    // Direct download from public folder
    window.location.href = '/sample-resume.pdf';
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={handleDownload}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Download Resume (API Method)
      </button>
      <button
        onClick={handleDirectDownload}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Download Resume (Direct Method)
      </button>
    </div>
  );
};

export default DownloadButton; 