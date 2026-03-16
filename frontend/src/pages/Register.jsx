import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, departmentAPI } from '../services/api';
import { 
  Users, 
  UserPlus, 
  LayoutDashboard, 
  ClipboardCheck, 
  Settings, 
  LogOut,
  Menu,
  X,
  Upload,
  Video,
  Camera,
  QrCode
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    departmentId: '',
    role: 'STAFF'
  });
  const [departments, setDepartments] = useState([]);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [captureMode, setCaptureMode] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: UserPlus, label: 'Enroll Employee', path: '/register' },
    { icon: Users, label: 'User Management', path: '/users' },
    { icon: ClipboardCheck, label: 'Attendance', path: '/attendance' },
    { icon: QrCode, label: 'QR Card Manager', path: '/qr-manager' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  useEffect(() => {
    return () => {
      // Cleanup webcam stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentAPI.getAll();
        setDepartments(response.data.data || []);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  // Handle camera stream when captureMode changes
  useEffect(() => {
    const initCamera = async () => {
      if (captureMode && videoRef.current) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480, facingMode: 'user' } 
          });
          setStream(mediaStream);
          videoRef.current.srcObject = mediaStream;
        } catch (err) {
          setError('Unable to access camera. Please check permissions.');
          console.error('Camera error:', err);
          setCaptureMode(false);
        }
      }
    };
    
    if (captureMode) {
      initCamera();
    }
  }, [captureMode]);

  const startCamera = () => {
    setCaptureMode(true);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCaptureMode(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'employee-photo.jpg', { type: 'image/jpeg' });
        setImageFile(file);
        setImagePreview(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }, 'image/jpeg', 0.95);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setGeneratedPassword('');

    setLoading(true);

    try {
      // Include profile image in registration data
      const registrationData = {
        ...formData,
        profileImage: imagePreview // Send base64 image data
      };
      
      const response = await authAPI.register(registrationData);
      
      // Store the generated password from backend
      const tempPassword = response.data.tempPassword;
      setGeneratedPassword(tempPassword);
      setSuccess(true);
      
      // Clear form
      setFormData({
        employeeId: '',
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        departmentId: '',
        role: 'STAFF'
      });
      setImageFile(null);
      setImagePreview(null);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col text-black`} style={{ backgroundColor: '#DECACA' }}>
        <div className="p-4 flex items-center justify-between border-b border-gray-400">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 flex items-center justify-center">
                <img 
                  src="/images/brgymaharlikalogo.png" 
                  alt="Barangay Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="font-bold text-sm">Barangay</h2>
                <p className="text-xs text-gray-600">Maharlika</p>
              </div>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#C4B4AE] rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-2 px-3">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center ${sidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-all duration-200 focus:outline-none ${
                    location.pathname === item.path
                      ? 'text-white shadow-lg' 
                      : 'text-black hover:bg-[#C4B4AE]'
                  }`}
                  style={location.pathname === item.path ? { backgroundColor: '#B8A09A' } : {}}
                >
                  <item.icon size={20} />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-400">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 text-black`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-800">Enroll New Employee</h1>
            <p className="text-sm text-gray-500 mt-1">Add a new employee to the attendance system</p>
          </div>
        </header>

        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="card">{/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <p className="font-semibold">✅ Employee registered successfully!</p>
              <p className="text-sm mt-1">Employee profile with picture has been created and can now be tracked in the attendance system.</p>
              <p className="text-sm mt-1">Temporary password generated: <span className="font-semibold">{generatedPassword}</span></p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Employee Photo Section */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Profile Picture</h3>
              <p className="text-sm text-gray-600 mb-4">Add a profile picture for the employee ID card and system display.</p>
              
              {captureMode ? (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto"
                      style={{ minHeight: '240px' }}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="btn-primary flex-1"
                    >
                      <Camera size={16} className="inline mr-2" />
                      Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Profile Preview" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                      <Camera size={32} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="btn-primary"
                      >
                        <Video size={16} className="inline mr-2" />
                        Start Camera
                      </button>
                      <label className="btn-secondary cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <Upload size={16} className="inline mr-2" />
                        Upload Photo
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Capture a photo using webcam or upload an image. Max size: 5MB
                    </p>
                  </div>
                </div>
              )}
              
              {/* Hidden canvas for capturing */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Employee ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="e.g., EMP-2026-001"
                  className="input-field"
                  required
                />
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="input-field"
                  required
                />
              </div>

              {/* Middle Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  placeholder="Middle Name (Optional)"
                  className="input-field"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="input-field"
                  required
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="input-field"
                  required
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="09XX XXX XXXX"
                  className="input-field"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="STAFF">STAFF</option>
                  <option value="OFFICIAL">OFFICIAL</option>
                  <option value="VOLUNTEER">VOLUNTEER</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Department (Optional)</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Admin onboarding:</strong> Enroll employee details here, then generate the employee QR card in QR Card Manager for attendance scanning.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-8">
              <button 
                type="submit" 
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? 'Enrolling...' : 'Enroll Employee'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/dashboard')}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
