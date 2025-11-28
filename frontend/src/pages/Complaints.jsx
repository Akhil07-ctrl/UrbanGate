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
  ChevronLeft,
  Download,
  Trash2,
  Image as ImageIcon,
  FileText,
  AlertTriangle,
  Menu,
  X as CloseIcon,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
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

const ITEMS_PER_PAGE = 10;
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'priority', label: 'Priority' },
];

// File upload component
const FileUpload = ({ files = [], onAdd, onRemove, maxFiles = 5 }) => {
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
          <h4 className="text-sm font-medium text-gray-700">Attachments ({files.length}/{maxFiles})</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  {file.type?.startsWith('image/') ? (
                    <ImageIcon className="h-4 w-4 text-blue-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-sm text-gray-700 truncate max-w-xs">
                    {file.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
        [name]: undefined
      }));
    }
  };

  const handleFileAdd = (newFiles) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileRemove = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit({ ...formData, files });
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
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter a brief title for your complaint"
          className={`w-full ${errors.title ? 'border-red-300' : ''}`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          placeholder="Please provide detailed information about your complaint"
          className={`w-full ${errors.description ? 'border-red-300' : ''}`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
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
            className={`w-full ${errors.category ? 'border-red-300' : ''}`}
          >
            <option value="">Select a category</option>
            {CATEGORY_OPTIONS.map(category => (
              <option key={category} value={category.toLowerCase()}>
                {category}
              </option>
            ))}
          </Select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
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
            className="w-full"
          >
            {PRIORITY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
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
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {initialData._id ? 'Update' : 'Submit'} Complaint
        </Button>
      </div>
    </form>
  );
};

// Complaint card component
const ComplaintCard = ({ complaint, onClick }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { bg: 'bg-blue-100 text-blue-800', icon: <AlertCircle className="h-4 w-4" /> },
      'in-progress': { bg: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4" /> },
      resolved: { bg: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
      closed: { bg: 'bg-gray-100 text-gray-800', icon: <X className="h-4 w-4" /> },
    };
    
    const config = statusConfig[status] || statusConfig.open;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg}`}>
        {config.icon}
        <span className="ml-1 capitalize">{status.replace('-', ' ')}</span>
      </span>
    );
  };
  
  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        priorityConfig[priority] || 'bg-gray-100 text-gray-800'
      }`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {complaint.title}
            </h3>
            {getStatusBadge(complaint.status)}
            {getPriorityBadge(complaint.priority)}
          </div>
          
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {complaint.description}
          </p>
          
          <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
            <div className="flex items-center">
              <User className="h-3.5 w-3.5 mr-1" />
              <span>{complaint.createdBy?.name || 'Anonymous'}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}</span>
            </div>
            {complaint.comments?.length > 0 && (
              <div className="flex items-center">
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                <span>{complaint.comments.length} {complaint.comments.length === 1 ? 'comment' : 'comments'}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="ml-4 flex-shrink-0">
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </Card>
  );
};

// Main Complaints component
const Complaints = () => {
  // UI State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Auth & Routing
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const complaintId = searchParams.get('id');
  
  // Data State
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTab, setSelectedTab] = useState('all');
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggle filter panel
  const toggleFilterPanel = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Handle filter change
  const handleFilterChange = (name, value) => {
    const newFilters = {
      ...filters,
      [name]: value
    };
    setFilters(newFilters);
    
    // Update URL with current filters
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    navigate(`?${params.toString()}`, { replace: true });
    
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleFilterChange('search', value);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    handleFilterChange('status', tab === 'all' ? '' : tab);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    handleFilterChange('sort', e.target.value);
  };

  // Apply filters and sorting to complaints
  const applyFiltersAndSorting = useCallback(() => {
    let result = [...complaints];
    
    // Apply status filter
    if (filters.status) {
      result = result.filter(complaint => complaint.status === filters.status);
    }
    
    // Apply priority filter
    if (filters.priority) {
      result = result.filter(complaint => complaint.priority === filters.priority);
    }
    
    // Apply category filter
    if (filters.category) {
      result = result.filter(complaint => complaint.category === filters.category);
    }
    
    // Apply search
    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      result = result.filter(complaint => 
        complaint.title.toLowerCase().includes(searchTerm) ||
        complaint.description.toLowerCase().includes(searchTerm) ||
        (complaint.comments?.some(comment => 
          comment.text.toLowerCase().includes(searchTerm)
        ))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (filters.sort) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    
    // Update pagination
    const total = Math.ceil(result.length / ITEMS_PER_PAGE);
    setTotalPages(total);
    
    // Apply pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedResult = result.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    setFilteredComplaints(paginatedResult);
  }, [complaints, filters, searchQuery, currentPage]);

  // Fetch complaints from API
  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      // Replace with your actual API call
      // const response = await api.get('/api/complaints');
      // setComplaints(response.data);
      
      // Mock data for demonstration
      const mockComplaints = [
        {
          _id: '1',
          title: 'Water leakage in bathroom',
          description: 'There is a constant water leak in the master bathroom that needs immediate attention.',
          status: 'open',
          priority: 'high',
          category: 'maintenance',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          createdBy: { name: 'John Doe' },
          comments: [
            { text: 'I will take a look at this today.', user: { name: 'Maintenance Team' }, createdAt: new Date(Date.now() - 1800000).toISOString() }
          ]
        },
        {
          _id: '2',
          title: 'Parking spot occupied',
          description: 'Someone has parked in my assigned parking spot (A12).',
          status: 'in-progress',
          priority: 'medium',
          category: 'parking',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          createdBy: { name: 'Jane Smith' },
          comments: []
        },
        {
          _id: '3',
          title: 'Garbage not collected',
          description: 'The garbage in the common area has not been collected for 2 days.',
          status: 'open',
          priority: 'low',
          category: 'cleanliness',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          createdBy: { name: 'Robert Johnson' },
          comments: []
        },
        {
          _id: '4',
          title: 'Broken elevator',
          description: 'The elevator on the north side is not working properly.',
          status: 'resolved',
          priority: 'high',
          category: 'maintenance',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          resolvedAt: new Date(Date.now() - 86400000).toISOString(),
          createdBy: { name: 'Emily Davis' },
          comments: [
            { text: 'We are aware of the issue and working on it.', user: { name: 'Maintenance Team' }, createdAt: new Date(Date.now() - 172800000).toISOString() },
            { text: 'The issue has been resolved.', user: { name: 'Maintenance Team' }, createdAt: new Date(Date.now() - 86400000).toISOString() }
          ]
        },
        {
          _id: '5',
          title: 'Noise complaint',
          description: 'Loud music coming from apartment 302 after midnight.',
          status: 'closed',
          priority: 'medium',
          category: 'noise',
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          resolvedAt: new Date(Date.now() - 345600000).toISOString(),
          closedAt: new Date(Date.now() - 345600000).toISOString(),
          createdBy: { name: 'Michael Brown' },
          comments: [
            { text: 'We have spoken to the resident and they have agreed to keep the noise down.', user: { name: 'Security Team' }, createdAt: new Date(Date.now() - 345600000).toISOString() }
          ]
        }
      ];
      
      setComplaints(mockComplaints);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints. Please try again.');
      setLoading(false);
    }
  }, []);

  // Handle form submission
  const handleSubmitComplaint = async (formData) => {
    try {
      // Replace with your actual API call
      // await api.post('/api/complaints', formData);
      
      // For demo, just add to the local state
      const newComplaint = {
        _id: Math.random().toString(36).substr(2, 9),
        ...formData,
        status: 'open',
        createdAt: new Date().toISOString(),
        createdBy: { name: user?.name || 'Current User' },
        comments: []
      };
      
      setComplaints(prev => [newComplaint, ...prev]);
      setIsFormOpen(false);
      toast.success('Complaint submitted successfully!');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('Failed to submit complaint. Please try again.');
    }
  };

  // Handle complaint click
  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint);
    // On mobile, we'll show a modal instead of navigating
    if (window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      navigate(`/complaints/${complaint._id}`);
    }
  };

  // Close complaint details
  const closeComplaintDetails = () => {
    setSelectedComplaint(null);
    document.body.style.overflow = 'auto';
  };

  // Load complaints on component mount
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Apply filters and sorting when complaints or filters change
  useEffect(() => {
    if (complaints.length > 0) {
      applyFiltersAndSorting();
    }
  }, [complaints, filters, searchQuery, currentPage, applyFiltersAndSorting]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 ml-2 lg:ml-0">Complaints</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={toggleFilterPanel}
                className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open filters</span>
                <SlidersHorizontal className="h-5 w-5" />
              </button>
              
              <Button
                onClick={() => setIsFormOpen(true)}
                className="hidden sm:flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Complaint
              </Button>
              
              <Button
                onClick={() => setIsFormOpen(true)}
                size="icon"
                className="sm:hidden"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile filter dialog */}
        <div className={`fixed inset-0 z-40 lg:hidden ${isFilterOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={toggleFilterPanel}></div>
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                <button
                  type="button"
                  onClick={toggleFilterPanel}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-6">
              {/* Filter options will go here */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Status</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={filters.status === 'open'}
                      onChange={() => handleFilterChange('status', filters.status === 'open' ? '' : 'open')}
                    />
                    <span className="ml-2 text-sm text-gray-700">Open</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={filters.status === 'in-progress'}
                      onChange={() => handleFilterChange('status', filters.status === 'in-progress' ? '' : 'in-progress')}
                    />
                    <span className="ml-2 text-sm text-gray-700">In Progress</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={filters.status === 'resolved'}
                      onChange={() => handleFilterChange('status', filters.status === 'resolved' ? '' : 'resolved')}
                    />
                    <span className="ml-2 text-sm text-gray-700">Resolved</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={filters.status === 'closed'}
                      onChange={() => handleFilterChange('status', filters.status === 'closed' ? '' : 'closed')}
                    />
                    <span className="ml-2 text-sm text-gray-700">Closed</span>
                  </label>
                </div>
              </div>
              
              {/* Priority filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Priority</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      checked={filters.priority === 'high'}
                      onChange={() => handleFilterChange('priority', filters.priority === 'high' ? '' : 'high')}
                    />
                    <span className="ml-2 text-sm text-gray-700">High</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                      checked={filters.priority === 'medium'}
                      onChange={() => handleFilterChange('priority', filters.priority === 'medium' ? '' : 'medium')}
                    />
                    <span className="ml-2 text-sm text-gray-700">Medium</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      checked={filters.priority === 'low'}
                      onChange={() => handleFilterChange('priority', filters.priority === 'low' ? '' : 'low')}
                    />
                    <span className="ml-2 text-sm text-gray-700">Low</span>
                  </label>
                </div>
              </div>
              
              {/* Category filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Category</h3>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category.toLowerCase()}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sort options */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Sort By</h3>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  setFilters({
                    status: '',
                    priority: '',
                    category: '',
                    sort: 'newest',
                  });
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                variant="outline"
                className="w-full"
              >
                Clear all filters
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Sidebar - Filters (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label htmlFor="search" className="sr-only">Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="search"
                      name="search"
                      type="text"
                      placeholder="Search complaints..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                {/* Status filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Status</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={filters.status === 'open'}
                        onChange={() => handleFilterChange('status', filters.status === 'open' ? '' : 'open')}
                      />
                      <span className="ml-2 text-sm text-gray-700">Open</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={filters.status === 'in-progress'}
                        onChange={() => handleFilterChange('status', filters.status === 'in-progress' ? '' : 'in-progress')}
                      />
                      <span className="ml-2 text-sm text-gray-700">In Progress</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={filters.status === 'resolved'}
                        onChange={() => handleFilterChange('status', filters.status === 'resolved' ? '' : 'resolved')}
                      />
                      <span className="ml-2 text-sm text-gray-700">Resolved</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={filters.status === 'closed'}
                        onChange={() => handleFilterChange('status', filters.status === 'closed' ? '' : 'closed')}
                      />
                      <span className="ml-2 text-sm text-gray-700">Closed</span>
                    </label>
                  </div>
                </div>
                
                {/* Priority filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Priority</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        checked={filters.priority === 'high'}
                        onChange={() => handleFilterChange('priority', filters.priority === 'high' ? '' : 'high')}
                      />
                      <span className="ml-2 text-sm text-gray-700">High</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                        checked={filters.priority === 'medium'}
                        onChange={() => handleFilterChange('priority', filters.priority === 'medium' ? '' : 'medium')}
                      />
                      <span className="ml-2 text-sm text-gray-700">Medium</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={filters.priority === 'low'}
                        onChange={() => handleFilterChange('priority', filters.priority === 'low' ? '' : 'low')}
                      />
                      <span className="ml-2 text-sm text-gray-700">Low</span>
                    </label>
                  </div>
                </div>
                
                {/* Category filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Category</h3>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category.toLowerCase()}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Sort options */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Sort By</h3>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Clear filters */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({
                        status: '',
                        priority: '',
                        category: '',
                        sort: 'newest',
                      });
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </div>
          </aside>
          
          {/* Main content */}
          <div className="lg:col-span-9 xl:col-span-10">
            {/* Mobile search and filter bar */}
            <div className="lg:hidden mb-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label htmlFor="mobile-search" className="sr-only">Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="mobile-search"
                      name="mobile-search"
                      type="text"
                      placeholder="Search complaints..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleFilterPanel}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  <span>Filters</span>
                </button>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => handleTabChange('all')}
                  className={`${
                    selectedTab === 'all' 
                      ? 'border-indigo-500 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  All
                </button>
                <button
                  onClick={() => handleTabChange('open')}
                  className={`${
                    selectedTab === 'open' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Open
                </button>
                <button
                  onClick={() => handleTabChange('in-progress')}
                  className={`${
                    selectedTab === 'in-progress' 
                      ? 'border-yellow-500 text-yellow-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleTabChange('resolved')}
                  className={`${
                    selectedTab === 'resolved' 
                      ? 'border-green-500 text-green-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Resolved
                </button>
              </nav>
            </div>
            
            {/* Complaint list */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              </div>
            ) : filteredComplaints.length > 0 ? (
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint._id}
                    complaint={complaint}
                    onClick={handleComplaintClick}
                  />
                ))}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredComplaints.length + ((currentPage - 1) * ITEMS_PER_PAGE))}
                      </span>{' '}
                      of <span className="font-medium">{filteredComplaints.length + ((currentPage - 1) * ITEMS_PER_PAGE)}</span> results
                    </div>
                    <div className="flex-1 flex justify-end">
                      <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title="No complaints found"
                description="Try adjusting your search or filter criteria"
                action={
                  <Button
                    onClick={() => {
                      setFilters({
                        status: '',
                        priority: '',
                        category: '',
                        sort: 'newest',
                      });
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    variant="outline"
                  >
                    Clear filters
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </main>

      {/* New complaint modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="New Complaint"
        size="lg"
      >
        <ComplaintForm
          onSubmit={handleSubmitComplaint}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Complaint details modal (mobile) */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={closeComplaintDetails}
        title="Complaint Details"
        size="xl"
      >
        {selectedComplaint && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{selectedComplaint.title}</h2>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {selectedComplaint.createdBy?.name || 'Anonymous'}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {format(new Date(selectedComplaint.createdAt), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedComplaint.status === 'open'
                            ? 'bg-blue-100 text-blue-800'
                            : selectedComplaint.status === 'in-progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : selectedComplaint.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedComplaint.status.charAt(0).toUpperCase() + selectedComplaint.status.slice(1).replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedComplaint.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : selectedComplaint.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {selectedComplaint.priority.charAt(0).toUpperCase() + selectedComplaint.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeComplaintDetails}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-900">Description</h3>
              <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                {selectedComplaint.description}
              </div>
            </div>
            
            {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Attachments</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {selectedComplaint.attachments.map((file, index) => (
                    <div key={index} className="group relative">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-md overflow-hidden group-hover:opacity-75">
                        {file.type?.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <FileText className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <p className="text-gray-700 truncate">{file.name}</p>
                        <a
                          href={URL.createObjectURL(file)}
                          download={file.name}
                          className="text-indigo-600 hover:text-indigo-500"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Comments</h3>
              {selectedComplaint.comments && selectedComplaint.comments.length > 0 ? (
                <div className="space-y-4">
                  {selectedComplaint.comments.map((comment, index) => (
                    <div key={index} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <Avatar
                          name={comment.user?.name || 'Anonymous'}
                          size="sm"
                          className="h-8 w-8"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {comment.user?.name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No comments yet.</p>
              )}
              
              <div className="mt-6">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <Avatar
                      name={user?.name || 'You'}
                      size="sm"
                      className="h-8 w-8"
                    />
                  </div>
                  <div className="flex-1">
                    <form>
                      <div>
                        <Textarea
                          rows={3}
                          placeholder="Add a comment..."
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Button
                          type="submit"
                          size="sm"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Comment
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Complaints;