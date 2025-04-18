'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import '@/app/globals.css';
import axios from 'axios';
import { BounceLoader } from 'react-spinners';

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [labels, setLabels] = useState([]); //!Added
  const [imageURL, setImageURL] = useState(null); //!Added
  const [disable_btn, setDisable_btn] = useState(true);

  const [successMessage, setSuccessMessage] = useState('File uploaded successfully!'); //Added by Tirth

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFile(file);
      setError(null);
      setSuccess(false);
      setDisable_btn(false);
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
      const response = await axios.post(
        'https://safestrider-production.up.railway.app/predict-image',
        formData,
        {
          responseType: 'blob',
        }
      );
      
      const imageBlob = response.data;
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setImageURL(imageObjectURL);
      const labelHeader = response.headers['x-labels'];
      if (labelHeader) {
        setLabels(JSON.parse(labelHeader));
      }

      setSuccess(true);
      setSuccessMessage('Your Path!');

      // Remove sucess message after 5 seconds              Added by Tirth
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);                                         // Set the time for howmuch time it show sucess message

      setFile(null);
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
    } catch (err) {
      setError("Access Denied!" || 'Failed to upload file');
    } finally {
      setLoading(false);
    }

  };

  // Add to reset the whole condition
  const handleTryAnother = () => {
    setFile(null);
    setPreview(null);
    setLoading(false);
    setError(null);
    setSuccess(false);
    setLabels([]);
    setImageURL(null);
    setSuccessMessage('');
  };

  return (
    <div className="d flex-1 overflow-y-auto">
      <div className="flex flex-col items-center gap-4 p-4 min-h-full">
      {!success && (
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
            <p className="text-white/70">
              Drag and drop an image here, or click to select an image
            </p>
          )}
        </div>
      )}
        
        {preview && (
          <div className="w-full max-w-md p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-gray-600">Selected image: {file.name}</p>
              <div className="relative w-full max-w-md">
                <div className='transition-all duration-300 ease-in-out'>
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-white">
            <BounceLoader size={28} color='#3fb5d7' speedMultiplier={1.8}/>
            <span className='text-xl'>Mapping Your Route...</span>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-500 text-2xl p-2 bg-green-50 rounded border-b-emerald-600">
            {successMessage && <p>{successMessage}</p>}   {/* Modified by Tirth to show the message for the 5sec */}
            <div className="upload-result">
              <div className="w-full text-left mt-2">
                <h3 className="text-gray-700 text-center font-semibold mb-1">Images Predicted:</h3>
                <div className="flex flex-wrap gap-2 justify-center items-center">

                  {Object.entries(labels).map(([superclass, items]) => (
                    items.length > 0 && (
                      <div key={superclass} className="w-full text-center">
                        <h3 className="text-xl text-blue-700 font-semibold mb-3">
                          {superclass}
                        </h3>
                        <div className="flex flex-wrap gap-2 justify-center items-center">
                          {items.map((element, index) => (
                            <div
                              key={index}
                              className={`px-3 py-1 rounded-full text-sm font-medium ${superclass === 'Safe'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                                }`}
                            >
                              {element}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}

                </div>
              </div>

              <img
                src={imageURL}
                alt="Shortest Path Image"
                className="upload-image w-full flex justify-center"
              />
            </div>

              <img
                src={imageURL}
                alt="Shortest Path Image"
                className="upload-image"
              />
            </div>
          
        )}
        
        <button
          onClick={success ? handleTryAnother : handleUpload} // Toggle between upload and try another
          disabled={disable_btn ||loading}
          style={{fontFamily : 'var(--font-chakra)', transition: 'background-color 0.3s ease-in-out', fontFamily: 'var(--font-chakra)', fontSize: '1.2rem'}}
          className={`px-6 py-2 rounded-lg font-medium transition-colors
            ${disable_btn || loading ? 'bg-gray-500/30 font-bold text-white cursor-not-allowed' : 'bg-blue-500 hover:cursor-pointer text-white hover:bg-blue-600'}`}
        >
          {success ? 'Try Another' : loading ? 'Processing...' : 'Navigate'}
        </button>
      </div>
    </div>
  );
} 
