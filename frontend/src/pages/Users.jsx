import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { userAPI, departmentAPI } from '../services/api';
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
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
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
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  // Edit modal state
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', contactNumber: '', address: '', profileImage: '', departmentId: '' });
  const [departments, setDepartments] = useState([]);
  const [imagePreview, setImagePreview] = useState('');
  const [captureMode, setCaptureMode] = useState('upload');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle camera stream for capture mode
  useEffect(() => {
    let stream;
    const videoEl = videoRef.current;
    if (editUser && captureMode === 'camera' && videoEl) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          videoEl.srcObject = stream;
        })
        .catch(err => {
          alert('Unable to access camera: ' + err.message);
        });
    }
    return () => {
      if (videoEl && videoEl.srcObject) {
        videoEl.srcObject.getTracks().forEach(track => track.stop());
        videoEl.srcObject = null;
      }
    };
  }, [editUser, captureMode]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: UserPlus, label: 'Enroll Employee', path: '/register' },
    { icon: UsersIcon, label: 'User Management', path: '/users' },
    { icon: ClipboardCheck, label: 'Attendance', path: '/attendance' },
    { icon: QrCode, label: 'QR Card Manager', path: '/qr-manager' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

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
    setCurrentPage(1); // reset to first page on search
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

  const getRoleBadge = (role) => {
    const map = {
      ADMIN:     'bg-purple-100 text-purple-700 border border-purple-200',
      STAFF:     'bg-blue-100 text-blue-700 border border-blue-200',
      OFFICIAL:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
      VOLUNTEER: 'bg-amber-100 text-amber-700 border border-amber-200',
    };
    return map[role] || 'bg-gray-100 text-gray-600 border border-gray-200';
  };

  const activeCount  = users.filter(u => u.isActive).length;
  const adminCount   = users.filter(u => u.role === 'ADMIN').length;

  // Pagination derived values
  const totalPages   = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage     = Math.min(currentPage, totalPages);
  const pagedUsers   = filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Build visible page numbers (max 5 around current)
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, safePage - delta); i <= Math.min(totalPages, safePage + delta); i++) {
      range.push(i);
    }
    if (range[0] > 2) range.unshift('...');
    if (range[0] > 1) range.unshift(1);
    if (range[range.length - 1] < totalPages - 1) range.push('...');
    if (range[range.length - 1] < totalPages) range.push(totalPages);
    return range;
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
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage employee accounts and profile information</p>
            </div>
          </div>
          {/* Stats strip */}
          <div className="px-8 pb-4 flex gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block"></span>
              <span className="text-sm text-gray-500">Total:</span>
              <span className="text-sm font-bold text-gray-800">{users.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-sm text-gray-500">Active:</span>
              <span className="text-sm font-bold text-emerald-700">{activeCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
              <span className="text-sm text-gray-500">Admins:</span>
              <span className="text-sm font-bold text-purple-700">{adminCount}</span>
            </div>
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
                {searchTerm ? 'No users match your search.' : 'Enroll employees to get started.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pagedUsers.map((user) => {
                
                return (
                  <div key={user.id} className="card hover:shadow-xl transition-all duration-200 overflow-hidden group">
                    {/* Card top accent */}

                    <div className="flex items-start justify-between mb-3 mt-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-[#DECACA]" style={{ background: 'linear-gradient(135deg,#DECACA,#B8A09A)' }}>
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-lg">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 leading-tight">
                            {user.firstName} {user.lastName}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                      {/* Active status dot */}
                      <span title={user.isActive ? 'Active' : 'Inactive'}
                        className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                          user.isActive ? 'bg-emerald-500' : 'bg-red-400'
                        }`} />
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail size={13} className="mr-2 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.contactNumber && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone size={13} className="mr-2 flex-shrink-0" />
                          {user.contactNumber}
                        </div>
                      )}
                      {(user.barangay || user.department) && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin size={13} className="mr-2 flex-shrink-0" />
                          <span className="truncate">
                            {[user.department?.name, user.barangay?.name].filter(Boolean).join(' · ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setEditUser(user);
                            setEditForm({
                              firstName: user.firstName || '',
                              lastName: user.lastName || '',
                              email: user.email || '',
                              contactNumber: user.contactNumber || '',
                              address: user.address || '',
                              profileImage: user.profileImage || '',
                              departmentId: user.department?.id ? String(user.department.id) : ''
                            });
                            setImagePreview(user.profileImage || '');
                            setCaptureMode('upload');
                            setEditError('');
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

          {/* Pagination bar */}
          {!loading && filteredUsers.length > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left: result info + page size */}
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>
                  Showing{' '}
                  <span className="font-semibold text-gray-800">
                    {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filteredUsers.length)}
                  </span>
                  {' '}of{' '}
                  <span className="font-semibold text-gray-800">{filteredUsers.length}</span>
                  {' '}users
                </span>
                <span className="text-gray-300">|</span>
                <label className="flex items-center gap-1.5">
                  Per page:
                  <select
                    value={pageSize}
                    onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#B8A09A] bg-white"
                  >
                    {[6, 9, 12, 24].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Right: page buttons */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={safePage === 1}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-[#DECACA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="First page"
                  >
                    <ChevronsLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-[#DECACA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {getPageNumbers().map((pg, idx) =>
                    pg === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 text-sm select-none">…</span>
                    ) : (
                      <button
                        key={pg}
                        onClick={() => setCurrentPage(pg)}
                        className={`min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                          pg === safePage
                            ? 'text-white shadow-sm'
                            : 'text-gray-600 hover:bg-[#DECACA]'
                        }`}
                        style={pg === safePage ? { background: 'linear-gradient(135deg,#C4B4AE,#9e7b77)' } : {}}
                      >
                        {pg}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-[#DECACA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={safePage === totalPages}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-[#DECACA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Last page"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

        {/* Edit User Modal */}
        {editUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(6px)', background: 'rgba(180,140,134,0.25)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setEditUser(null); }}
          >
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '92vh' }}>
              {/* Modal gradient header */}
              <div className="relative px-6 pt-6 pb-8 flex items-end gap-4" style={{ background: 'linear-gradient(135deg,#DECACA 0%,#B8A09A 100%)' }}>
                <button
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/40 hover:bg-white/70 text-white transition-colors"
                  onClick={() => setEditUser(null)}
                  title="Close"
                >
                  <X size={18} />
                </button>
                {/* Avatar in header */}
                <button
                  type="button"
                  title="Click to upload photo"
                  onClick={() => { setCaptureMode('upload'); fileInputRef.current?.click(); }}
                  className="relative w-20 h-20 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden group cursor-pointer ring-4 ring-white/60 hover:ring-white transition-all"
                  style={{ background: 'linear-gradient(135deg,#fff2f0,#e0c8c4)' }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold" style={{ color: '#8a6460' }}>
                      {editForm.firstName?.[0]}{editForm.lastName?.[0]}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera size={22} className="text-white" />
                  </div>
                </button>
                <div className="pb-1">
                  <p className="text-white font-bold text-lg leading-tight">{editForm.firstName} {editForm.lastName}</p>
                  <p className="text-white/75 text-sm">{editForm.email}</p>
                  <p className="text-white/70 text-xs mt-0.5">Click avatar to change photo</p>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-6 py-5">
              <form
                id="edit-user-form"
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setEditSaving(true);
                  setEditError('');
                  try {
                    await userAPI.update(editUser.id, {
                      firstName: editForm.firstName,
                      lastName: editForm.lastName,
                      contactNumber: editForm.contactNumber,
                      address: editForm.address,
                      departmentId: editForm.departmentId || null,
                      profileImage: editForm.profileImage,
                    });
                    await fetchUsers();
                    setEditUser(null);
                  } catch (err) {
                    setEditError('Failed to update user: ' + (err.response?.data?.message || err.message));
                  } finally {
                    setEditSaving(false);
                  }
                }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#DECACA] hover:bg-[#C4B4AE] text-gray-800 transition-colors"
                    onClick={() => { setCaptureMode('upload'); fileInputRef.current?.click(); }}
                  >
                    <Upload size={14} /> Upload Photo
                  </button>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      captureMode === 'camera' ? 'bg-gray-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => setCaptureMode(captureMode === 'camera' ? 'upload' : 'camera')}
                  >
                    <Camera size={14} /> {captureMode === 'camera' ? 'Hide Camera' : 'Use Camera'}
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                      onClick={() => { setImagePreview(''); setEditForm(f => ({ ...f, profileImage: '' })); }}
                    >
                      <X size={14} /> Remove
                    </button>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        setEditError('Image must be smaller than 5 MB.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreview(reader.result);
                        setEditForm(f => ({ ...f, profileImage: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                    e.target.value = '';
                  }}
                />

                {captureMode === 'camera' && (
                  <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <video ref={videoRef} autoPlay playsInline muted className="rounded-lg w-full border border-gray-200" style={{ maxHeight: 180 }} />
                    <canvas ref={canvasRef} width={320} height={240} className="hidden" />
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                      onClick={() => {
                        if (videoRef.current && canvasRef.current) {
                          const ctx = canvasRef.current.getContext('2d');
                          ctx.drawImage(videoRef.current, 0, 0, 320, 240);
                          const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
                          setImagePreview(dataUrl);
                          setEditForm(f => ({ ...f, profileImage: dataUrl }));
                          setCaptureMode('upload');
                        }
                      }}
                    >
                      <Video size={14} /> Capture Photo
                    </button>
                  </div>
                )}

                <div className="h-px bg-gray-100" />

                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">First Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8A09A] focus:border-transparent transition"
                      value={editForm.firstName}
                      onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Last Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8A09A] focus:border-transparent transition"
                      value={editForm.lastName}
                      onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Email <span className="normal-case font-normal text-gray-400">(cannot be changed)</span>
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    value={editForm.email}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8A09A] focus:border-transparent transition"
                    value={editForm.contactNumber}
                    onChange={e => setEditForm(f => ({ ...f, contactNumber: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8A09A] focus:border-transparent transition"
                    value={editForm.address}
                    onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Department</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8A09A] focus:border-transparent transition bg-white"
                    value={editForm.departmentId || ''}
                    onChange={e => setEditForm(f => ({ ...f, departmentId: e.target.value }))}
                  >
                    <option value="">No Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={String(dept.id)}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {editError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    <X size={14} className="mt-0.5 flex-shrink-0" />
                    {editError}
                  </div>
                )}
              </form>
              </div>

              {/* Sticky footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/80">
                <button
                  type="button"
                  className="px-5 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  onClick={() => setEditUser(null)}
                  disabled={editSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="edit-user-form"
                  className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
                  style={{ background: editSaving ? '#C4B4AE' : 'linear-gradient(135deg,#C4B4AE,#9e7b77)' }}
                  disabled={editSaving}
                >
                  {editSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

export default Users;
