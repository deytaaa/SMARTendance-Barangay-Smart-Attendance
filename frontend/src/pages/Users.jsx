import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { userAPI } from '../services/api';
import { 
  Users as UsersIcon, 
  UserPlus, 
  LayoutDashboard, 
  ClipboardCheck, 
  Settings, 
  LogOut,
  Menu,
  X,
  Edit,
  Trash2,
  Search,
  Mail,
  Phone,
  Camera,
  Video,
  Upload,
  QrCode,
  MapPin
} from 'lucide-react';

function Users() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  // Edit modal state
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', profileImage: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [captureMode, setCaptureMode] = useState('upload');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle camera stream for capture mode
  useEffect(() => {
    let stream;
    if (editUser && captureMode === 'camera' && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          videoRef.current.srcObject = stream;
        })
        .catch(err => {
          alert('Unable to access camera: ' + err.message);
        });
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [editUser, captureMode]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: UserPlus, label: 'Register Employee', path: '/register' },
    { icon: UsersIcon, label: 'User Management', path: '/users' },
    { icon: ClipboardCheck, label: 'Attendance', path: '/attendance' },
    { icon: QrCode, label: 'QR Card Manager', path: '/qr-manager' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll({ limit: 1000 });
      const allUsers = response.data.data || [];
      // Show all users including admins for management
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    // Prevent deleting own account
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.id === userId) {
      alert('You cannot delete your own account!');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      await userAPI.delete(userId);
      setUsers(users.filter(u => u.id !== userId));
      alert('User deleted successfully');
    } catch (err) {
      alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage employee accounts and face enrollment status</p>
          </div>
        </header>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Search Bar */}
          <div className="card mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Users List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="card text-center py-12">
              <UsersIcon size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Users Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No users match your search.' : 'Register employees to get started.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => {
                
                return (
                  <div key={user.id} className="card hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                          {user.profileImage ? (
                            <img 
                              src={user.profileImage} 
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-600 font-bold text-lg">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {user.firstName} {user.lastName}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail size={14} className="mr-2" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone size={14} className="mr-2" />
                          {user.phone}
                        </div>
                      )}
                      {user.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin size={14} className="mr-2" />
                          {user.address}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditUser(user);
                            setEditForm({
                              firstName: user.firstName || '',
                              lastName: user.lastName || '',
                              email: user.email || '',
                              phone: user.phone || '',
                              address: user.address || '',
                              profileImage: user.profileImage || ''
                            });
                            setImagePreview(user.profileImage || '');
                            setCaptureMode('upload');
                          }}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                          disabled={JSON.parse(localStorage.getItem('user') || '{}').id === user.id}
                          className={`p-2 rounded-lg transition-colors ${
                            JSON.parse(localStorage.getItem('user') || '{}').id === user.id
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={JSON.parse(localStorage.getItem('user') || '{}').id === user.id ? "Cannot delete your own account" : "Delete User"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        {/* Edit User Modal */}
        {editUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
              <button
                className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-800"
                onClick={() => setEditUser(null)}
                title="Close"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold mb-4">Edit User</h2>
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await userAPI.update(editUser.id, {
                      firstName: editForm.firstName,
                      lastName: editForm.lastName,
                      email: editForm.email, // Only for display, not updatable by backend
                      phone: editForm.phone,
                      address: editForm.address,
                      profileImage: editForm.profileImage,
                    });
                    await fetchUsers();
                    setEditUser(null);
                  } catch (err) {
                    alert('Failed to update user: ' + (err.response?.data?.message || err.message));
                  }
                }}
              >
                <div className="flex flex-col items-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-2 relative">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl text-blue-600 font-bold">
                        {editForm.firstName?.[0]}{editForm.lastName?.[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <button
                      type="button"
                      className={`px-3 py-1 rounded ${captureMode === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      onClick={() => setCaptureMode('upload')}
                    >
                      <Upload size={16} className="inline mr-1" /> Upload
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1 rounded ${captureMode === 'camera' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      onClick={() => setCaptureMode('camera')}
                    >
                      <Camera size={16} className="inline mr-1" /> Camera
                    </button>
                  </div>
                  {captureMode === 'upload' && (
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-2"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImagePreview(reader.result);
                            setEditForm(f => ({ ...f, profileImage: reader.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  )}
                  {captureMode === 'camera' && (
                    <div className="flex flex-col items-center mt-2">
                      <video ref={videoRef} autoPlay playsInline muted width={96} height={96} className="rounded mb-2 border" />
                      <canvas ref={canvasRef} width={96} height={96} style={{ display: 'none' }} />
                      <button
                        type="button"
                        className="px-3 py-1 rounded bg-green-600 text-white mt-1 flex items-center"
                        onClick={async () => {
                          if (videoRef.current && canvasRef.current) {
                            const video = videoRef.current;
                            const canvas = canvasRef.current;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                            const dataUrl = canvas.toDataURL('image/png');
                            setImagePreview(dataUrl);
                            setEditForm(f => ({ ...f, profileImage: dataUrl }));
                          }
                        }}
                      >
                        <Video size={16} className="inline mr-1" /> Capture
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={editForm.firstName}
                    onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={editForm.lastName}
                    onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full border rounded px-3 py-2"
                    value={editForm.email}
                    onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={editForm.phone}
                    onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={editForm.address}
                    onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700"
                    onClick={() => setEditUser(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 text-white"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

export default Users;
