'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import '@/app/globals.css';
import axios from 'axios';

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFile(file);
      setError(null);
      setSuccess(false);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:8000/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(true);
      setFile(null);
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d flex-1 overflow-y-auto">
      <div className="flex flex-col items-center gap-4 p-4 min-h-full">
        <div
          {...getRootProps()}
          className={`w-full max-w-md p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} disabled={loading} />
          {isDragActive ? (
            <p className="text-blue-500">Drop the image here...</p>
          ) : (
            <p className="text-gray-600">
              Drag and drop an image here, or click to select an image
            </p>
          )}
        </div>
        
        {preview && (
          <div className="w-full max-w-md p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-gray-600">Selected image: {file.name}</p>
              <div className="relative w-full aspect-square max-w-md">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-blue-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span>Uploading...</span>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-500 text-sm p-2 bg-green-50 rounded">
            File uploaded successfully!
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`px-6 py-2 rounded-lg font-medium transition-colors
            ${!file || loading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
} 