import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';

// Components
import { 
  Card, 
  Button, 
  Input, 
  Textarea, 
  Select, 
  Loading, 
  EmptyState, 
  Badge, 
  Modal, 
  Tabs, 
  TabList, 
  Tab, 
  TabPanels, 
  TabPanel, 
  Avatar,
  Pagination,
  FilePreview,
  CommentList,
  CommentForm,
  StatusBadge,
  PriorityBadge
} from '../components/UI';

// Icons
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  Paperclip, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  User, 
  ChevronRight,
  Download,
  Trash2,
  Image as ImageIcon,
  FileText,
  AlertTriangle
} from 'lucide-react';

// Utils
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

// Constants
const COMPLAINT_STATUS = {
  open: { label: 'Open', color: 'blue' },
  'in-progress': { label: 'In Progress', color: 'yellow' },
  resolved: { label: 'Resolved', color: 'green' },
  closed: { label: 'Closed', color: 'gray' },
};

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const CATEGORY_OPTIONS = [
  'Maintenance',
  'Security',
  'Cleanliness',
  'Parking',
  'Noise',
  'Utilities',
  'Amenities',
  'Other'
];

// File upload component
const FileUpload = ({ files, onAdd, onRemove, maxFiles = 5 }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }
    onAdd(acceptedFiles);
  }, [files, maxFiles, onAdd]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <div className="space-y-2">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Paperclip className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">
            {isDragActive 
              ? 'Drop the files here...' 
              : 'Drag & drop files here, or click to select files'}
          </p>
          <p className="text-xs text-gray-400">
            Supported formats: JPG, PNG, GIF, PDF, DOC (Max 5MB)
          </p>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <FilePreview 
              key={index} 
              file={file}
              onRemove={() => onRemove(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Complaint card component
const ComplaintCard = ({ complaint, onClick }) => {
  const { _id, title, description, status, priority, createdAt, comments = [] } = complaint;
  const statusConfig = COMPLAINT_STATUS[status] || { label: status, color: 'gray' };
  
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(complaint)}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-lg">{title}</h3>
            <StatusBadge status={status} />
            <PriorityBadge priority={priority} />
          </div>
          <p className="text-gray-600 mt-1 line-clamp-2">{description}</p>
          
          <div className="flex items-center mt-3 text-sm text-gray-500 space-x-4">
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
            </div>
            <div>
              {format(new Date(createdAt), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </Card>
  );
};

// Complaint form component
const ComplaintForm = ({ initialData = {}, onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    category: initialData.category || '',
    priority: initialData.priority || 'medium',
  });
  
  const [files, setFiles] = useState(initialData.files || []);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFileAdd = (newFiles) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileRemove = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    try {
      setUploading(true);
      
      // Upload files if any
      let uploadedFiles = [];
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(file => {
          formData.append('files', file);
        });
        
        const response = await api.upload('/upload', formData);
        uploadedFiles = response.data.files;
      }
      
      // Submit complaint with file URLs
      await onSubmit({
        ...formData,
        files: uploadedFiles
      });
      
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Briefly describe the issue"
          error={errors.title}
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Please provide detailed information about the issue"
          error={errors.description}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <Select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select a category' },
              ...CATEGORY_OPTIONS.map(cat => ({
                value: cat.toLowerCase(),
                label: cat
              }))
            ]}
            error={errors.category}
          />
        </div>
        
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <Select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={PRIORITY_OPTIONS}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Attachments (Optional)
        </label>
        <FileUpload 
          files={files}
          onAdd={handleFileAdd}
          onRemove={handleFileRemove}
          maxFiles={5}
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting || uploading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          loading={isSubmitting || uploading}
          disabled={isSubmitting || uploading}
        >
          {initialData._id ? 'Update' : 'Submit'} Complaint
        </Button>
      </div>
    </form>
  );
};

export const Complaints = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    category: searchParams.get('category') || '',
    sortBy: searchParams.get('sort') || 'newest',
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  
  // Fetch complaints with filters
  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.category && { category: filters.category }),
        ...(filters.sortBy && { sort: filters.sortBy }),
        ...(searchQuery && { search: searchQuery }),
      });
      
      // Update URL
      navigate(`?${params.toString()}`, { replace: true });
      
      // Fetch data
      const response = await api.get(`/complaints?${params}`);
      
      setComplaints(response.data.complaints || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.pages || 1,
      }));
      
    } catch (error) {
      console.error('Failed to fetch complaints', error);
      if (error.response?.status === 400) {
        toast.error('You must be part of a community to view complaints', {
          position: 'top-right',
          autoClose: 3000
        });
      } else {
        toast.error(error.message || 'Failed to load complaints. Please try again.', {
          position: 'top-right',
          autoClose: 3000
        });
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, searchQuery, navigate]);
  
  // Fetch complaints when filters change
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setFilters(prev => ({
      ...prev,
      status: tab === 'all' ? '' : tab,
    }));
    setPagination(prev => ({
      ...prev,
      page: 1, // Reset to first page when changing tabs
    }));
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({
      ...prev,
      page: 1, // Reset to first page when searching
    }));
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      page,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle create/update complaint
  const handleSubmitComplaint = async (data) => {
    try {
      if (selectedComplaint?._id) {
        // Update existing complaint
        await api.put(`/complaints/${selectedComplaint._id}`, data);
        toast.success('Complaint updated successfully');
      } else {
        // Create new complaint
        await api.post('/complaints', data);
        toast.success('Complaint submitted successfully');
      }
      
      setShowForm(false);
      setSelectedComplaint(null);
      fetchComplaints();
      
    } catch (error) {
      console.error('Error submitting complaint:', error);
      if (error.response?.status === 400) {
        toast.error(error.message || 'You must be part of a community to create complaints', {
          position: 'top-right',
          autoClose: 3000
        });
      } else {
        toast.error(error.message || 'Failed to submit complaint', {
          position: 'top-right',
          autoClose: 3000
        });
      }
    }
  };
  
  // Handle delete complaint
  const handleDeleteComplaint = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/complaints/${id}`);
      toast.success('Complaint deleted successfully');
      
      if (selectedComplaint?._id === id) {
        setSelectedComplaint(null);
      }
      
      fetchComplaints();
      
    } catch (error) {
      console.error('Error deleting complaint:', error);
      toast.error(error.message || 'Failed to delete complaint', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };
  
  // Handle status update
  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/complaints/${id}`, { status });
      toast.success(`Complaint marked as ${status}`);
      
      if (selectedComplaint?._id === id) {
        setSelectedComplaint(prev => ({
          ...prev,
          status,
        }));
      }
      
      fetchComplaints();
      
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };
  
  // Handle add comment
  const handleAddComment = async (complaintId, comment) => {
    try {
      const response = await api.post(`/complaints/${complaintId}/comments`, { 
        text: comment,
        isInternal: user.role !== 'resident', // Internal notes for staff/admin
      });
      
      if (selectedComplaint?._id === complaintId) {
        setSelectedComplaint(prev => ({
          ...prev,
          comments: [...(prev.comments || []), response.data.comment],
        }));
      }
      
      fetchComplaints();
      return true;
      
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
      return false;
    }
  };


  if (loading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pagination.total} {pagination.total === 1 ? 'complaint' : 'complaints'} found
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button onClick={() => { setSelectedComplaint(null); setShowForm(true); }}>+ New Complaint</Button>
        </div>
      </div>
      
      {/* Tabs for filtering by status */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          <button
            type="button"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleTabChange('all')}
          >
            All Complaints
          </button>
          
          {Object.entries(COMPLAINT_STATUS).map(([key, { label, color }]) => (
            <button
              key={key}
              type="button"
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                selectedTab === key
                  ? `border-${color}-500 text-${color}-600`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange(key)}
            >
              {label}
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {pagination.total}
              </span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Search and filter bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search complaints..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="min-w-[120px]"
              >
                <option value="">All Priorities</option>
                {PRIORITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              
              <Select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="min-w-[150px]"
              >
                <option value="">All Categories</option>
                {CATEGORY_OPTIONS.map(category => (
                  <option key={category.toLowerCase()} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </Select>
              
              <Select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="min-w-[160px]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority (High to Low)</option>
              </Select>
              
              <Button type="submit" variant="outline" className="whitespace-nowrap">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              
              {(filters.priority || filters.category || filters.sortBy !== 'newest') && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {
                    setFilters({
                      status: selectedTab === 'all' ? '' : selectedTab,
                      priority: '',
                      category: '',
                      sortBy: 'newest',
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
      
      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loading className="h-10 w-10 text-primary-500 mx-auto mb-3" />
            <p className="text-gray-600">Loading complaints...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Empty state */}
          {complaints.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle className="h-12 w-12 text-gray-400 mx-auto" />}
              title="No complaints found"
              description={
                searchQuery || Object.values(filters).some(Boolean)
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating a new complaint.'
              }
              action={
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Complaint
                </Button>
              }
            />
          ) : (
            <>
              {/* Complaints list */}
              <div className="space-y-4 mb-6">
                {complaints.map((complaint) => (
                  <ComplaintCard 
                    key={complaint._id} 
                    complaint={complaint} 
                    onClick={(complaint) => {
                      setSelectedComplaint(complaint);
                      setShowForm(false);
                    }}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Complaint Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedComplaint(null);
        }}
        title={selectedComplaint ? 'Edit Complaint' : 'New Complaint'}
        size="lg"
      >
        <ComplaintForm
          initialData={selectedComplaint || {}}
          onSubmit={handleSubmitComplaint}
          onCancel={() => {
            setShowForm(false);
            setSelectedComplaint(null);
          }}
          isSubmitting={false}
        />
      </Modal>

      {/* Complaint Details Modal */}
      {selectedComplaint && !showForm && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Complaint Details`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Complaint Header */}
            <div className="border-b pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-xl font-semibold">{selectedComplaint.title}</h2>
                    <StatusBadge status={selectedComplaint.status} />
                    <PriorityBadge priority={selectedComplaint.priority} />
                  </div>
                  <p className="text-gray-600 mb-3">{selectedComplaint.description}</p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span>Category: {selectedComplaint.category}</span>
                    <span>Created: {format(new Date(selectedComplaint.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(selectedComplaint._id, 'resolved')}
                      disabled={selectedComplaint.status === 'resolved'}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedComplaint(selectedComplaint);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteComplaint(selectedComplaint._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Comments & Updates</h3>
              <CommentList
                comments={selectedComplaint.comments || []}
                onAddComment={(comment) => handleAddComment(selectedComplaint._id, comment)}
                canAddComment={true}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
