import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from "../components/Header";
import {
  Upload,
  Image as ImageIcon,
  AlertCircle,
  X,
  Edit3,
  Search
} from 'lucide-react';

const BASE_URL = 'http://localhost:5001';

const ImageManagement = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [carouselImages, setCarouselImages] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const MAX_IMAGES = 2;
  
  const [formData, setFormData] = useState({
    title: '',
    address: '20,Krishna,Aditya Nagar, Chunchgatta Main Rd, Kothnoor Dinne, 8th Phase, J. P. Nagar, Bengaluru, Karnataka 560078',
    phone: '+91 9353515799',
    image: null
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      if (!user) {
        navigate('/login');
        return false;
      }
      return true;
    };

    if (checkAuth()) {
      fetchCarouselImages();
    }
  }, [navigate]);

  const fetchCarouselImages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/api/carousel-images`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.statusText}`);
      }
      
      const data = await response.json();
      const transformedData = data.map(image => ({
        ...image,
        url: `${BASE_URL}${image.url}`
      }));
      
      setCarouselImages(transformedData);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch images. Please try again.');
      setCarouselImages([]);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const showNotification = (message, type = 'success') => {
    if (type === 'error') {
      console.error(message);
      setError(message);
    } else {
      // You could implement a toast notification here
      alert(`${type.toUpperCase()}: ${message}`);
    }
  };

  const validateImageUrl = (url) => {
    try {
      return url.startsWith('http') ? url : `${BASE_URL}${url}`;
    } catch (error) {
      console.error('Error validating URL:', error);
      return url;
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (isEditMode) {
      setSelectedImage(prev => ({ ...prev, [id]: value }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleImageChange = (e) => {
    try {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5000000) {
          showNotification('File size should not exceed 5MB', 'error');
          return;
        }
        
        if (!file.type.startsWith('image/')) {
          showNotification('Please select an image file', 'error');
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.onerror = () => {
          showNotification('Failed to read file', 'error');
        };
        reader.readAsDataURL(file);
        setFormData(prev => ({ ...prev, image: file }));
      }
    } catch (error) {
      console.error('Error handling image:', error);
      showNotification('Failed to process image', 'error');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    try {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleImageChange({ target: { files: [file] } });
      } else {
        showNotification('Please drop an image file', 'error');
      }
    } catch (error) {
      console.error('Error handling drop:', error);
      showNotification('Failed to process dropped file', 'error');
    }
  };


  const validateForm = () => {
    try {
      if (!formData.title || (!isEditMode && !formData.image)) {
        showNotification('Please fill in all required fields', 'error');
        return false;
      }
      if (carouselImages.length >= MAX_IMAGES && !isEditMode) {
        showNotification(`Maximum ${MAX_IMAGES} images allowed`, 'error');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error validating form:', error);
      showNotification('Form validation failed', 'error');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('image', formData.image);

      const response = await fetch(`${BASE_URL}/api/carousel-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      showNotification('Image uploaded successfully');
      resetForm();
      await fetchCarouselImages();
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message || 'Failed to upload image', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedImage) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/carousel-images/${selectedImage._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: selectedImage.title,
          address: selectedImage.address,
          phone: selectedImage.phone
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update image');
      }

      showNotification('Image updated successfully');
      resetForm();
      await fetchCarouselImages();
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message || 'Failed to update image', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/carousel-images/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete image');
      }

      showNotification('Image deleted successfully');
      await fetchCarouselImages();
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message || 'Failed to delete image', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      address: '20,Krishna,Aditya Nagar, Chunchgatta Main Rd, Kothnoor Dinne, 8th Phase, J. P. Nagar, Bengaluru, Karnataka 560078',
      phone: '+91 9353515799',
      image: null
    });
    setImagePreview(null);
    setIsEditMode(false);
    setSelectedImage(null);
    setError(null);
  };

  const filteredImages = carouselImages.filter(image =>
    image.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isInitialized) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex" id="wrapper">
      <Sidebar isOpen={isSidebarOpen} isSidebar="Images" />
      <div id="page-content-wrapper">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="container-fluid">
          <h1 className="mt-4">Image Management</h1>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError(null)}
                aria-label="Close"
              ></button>
            </div>
          )}

          <div className="bg-secondary p-4">
            <div className="row justify-content-center">
              <div className="col-lg-12">
                {/* Search and Counter */}
                <div className="bg-dark p-4 rounded mb-4">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control bg-transparent text-white"
                          placeholder="Search images..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <label className="text-white">Search Images</label>
                      </div>
                    </div>
                    <div className="col-md-4 text-end">
                      <h5 className="text-white mb-0">
                        Images: {carouselImages.length}/{MAX_IMAGES}
                      </h5>
                    </div>
                  </div>
                </div>

                {/* Upload Form */}
                <div className="bg-dark p-4 rounded mb-4">
                  <h5 className="text-white mb-4">
                    {isEditMode ? 'Edit Image' : 'Upload New Image'}
                  </h5>
                  <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                      {!isEditMode && (
                        <div className="col-12">
                          <div
                            className="upload-drop-zone"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                          >
                            <input
                              type="file"
                              id="image"
                              className="upload-input"
                              onChange={handleImageChange}
                              accept="image/*"
                            />
                            <div className="upload-content text-center">
                              {!imagePreview ? (
                                <>
                                  <Upload size={48} className="text-primary mb-3" />
                                  <h5 className="text-white">Drop your image here or click to browse</h5>
                                  <p className="text-white-50 mb-0">Supports: JPG, PNG, WebP (Max 5MB)</p>
                                </>
                              ) : (
                                <div className="preview-container">
                                  <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="preview-image"
                                  />
                                  <button
                                    type="button"
                                    className="btn-remove-preview"
                                    onClick={() => {
                                      setImagePreview(null);
                                      setFormData(prev => ({ ...prev, image: null }));
                                    }}
                                  >
                                    <X size={20} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="col-12">
                        <div className="form-floating">
                          <input
                            type="text"
                            className="form-control bg-transparent text-white"
                            id="title"
                            placeholder="Image Title"
                            value={isEditMode ? selectedImage?.title : formData.title}
                            onChange={handleInputChange}
                          />
                          <label className="text-white">Title</label>
                        </div>
                      </div>

                      <div className="col-12">
                        {isEditMode ? (
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-primary flex-grow-1 py-3"
                              onClick={handleEdit}
                              disabled={loading}
                            >
                              {loading ? 'Updating...' : 'Update Image'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary py-3"
                              onClick={resetForm}
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="submit"
                            className="btn btn-primary w-100 py-3"
                            disabled={loading || carouselImages.length >= MAX_IMAGES}
                          >
                            {loading ? 'Uploading...' : 'Upload Image'}
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>

                {/* Image Gallery */}
                <div className="bg-dark p-4 rounded">
                  <div className="row g-4">
                    {filteredImages.map((image, index) => (
                      <div key={index} className="col-md-6">
                        <div className="card bg-secondary border-0">
                          <div className="position-relative">
                            <img
                              src={validateImageUrl(image.url)}
                              className="card-img-top"
                              alt={image.title}
                              style={{ height: '240px', objectFit: 'cover' }}
                              onClick={() => {
                                setSelectedImage(image);
                                setPreviewOpen(true);
                              }}
                            />
                            <div className="image-overlay">
                              <button
                                className="btn btn-light btn-sm me-2"
                                onClick={() => {
                                  setSelectedImage(image);
                                  setIsEditMode(true);
                                }}
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => deleteImage(image._id)}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="card-body">
                            <h5 className="card-title text-white mb-0">{image.title}</h5>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredImages.length === 0 && (
                      <div className="col-12 text-center py-5">
                        <ImageIcon size={48} className="text-white-50 mb-3" />
                        <h5 className="text-white">No Images Found</h5>
                        <p className="text-white-50 mb-0">
                          {searchTerm ? 'Try different search terms' : 'Upload your first image above'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Preview Modal */}
        {previewOpen && selectedImage && (
          <div className="modal-backdrop show" onClick={() => setPreviewOpen(false)}>
            <div className="preview-modal" onClick={e => e.stopPropagation()}>
              <button
                className="btn-close preview-close"
                onClick={() => setPreviewOpen(false)}
              />
              <img
                src={validateImageUrl(selectedImage.url)}
                alt={selectedImage.title}
                className="preview-modal-image"
              />
              <div className="preview-modal-info">
                <h4 className="text-dark">{selectedImage.title}</h4>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        <style jsx>{`
          /* Your existing styles here */
        `}</style>
      </div>
    </div>
  );
};

// Error Boundary Component
class ImageManagementErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in ImageManagement:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger text-center">
            <h4>Something went wrong</h4>
            <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ImageManagementWithErrorBoundary() {
  return (
    <ImageManagementErrorBoundary>
      <ImageManagement />
    </ImageManagementErrorBoundary>
  );
}