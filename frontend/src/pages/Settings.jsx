import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { barangayAPI, departmentAPI } from '../services/api';
import { 
  Users, 
  UserPlus, 
  LayoutDashboard, 
  ClipboardCheck, 
  Settings as SettingsIcon, 
  LogOut,
  Menu,
  X,
  Clock,
  Building2,
  MapPin,
  Phone,
  Mail,
  Save,
  Plus,
  Trash2,
  Edit,
  QrCode
} from 'lucide-react';

function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('system');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    cutoffTime: '09:00',
    gracePeriod: 15,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    shiftStart: '08:00',
    shiftEnd: '17:00'
  });

  // Barangay Settings
  const [barangaySettings, setBarangaySettings] = useState({
    name: 'Barangay Maharlika',
    address: '',
    contactNumber: '',
    email: '',
    captain: ''
  });

  // Departments
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [editingDept, setEditingDept] = useState(null);
  const [barangayId, setBarangayId] = useState(null);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: UserPlus, label: 'Register Employee', path: '/register' },
    { icon: Users, label: 'User Management', path: '/users' },
    { icon: ClipboardCheck, label: 'Attendance', path: '/attendance' },
    { icon: QrCode, label: 'QR Card Manager', path: '/qr-manager' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings' },
  ];

  const tabs = [
    { id: 'system', label: 'System Configuration', icon: Clock },
    { id: 'barangay', label: 'Barangay Information', icon: Building2 },
    { id: 'departments', label: 'Departments', icon: Users },
  ];

  useEffect(() => {
    fetchSettings();
    fetchDepartments();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await barangayAPI.getSettings();
      if (response.data) {
        setBarangaySettings(response.data);
      }
      
      // Also fetch barangay ID for department creation
      const barangaysResponse = await barangayAPI.getAll();
      if (barangaysResponse.data && barangaysResponse.data.length > 0) {
        setBarangayId(barangaysResponse.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const saveSystemSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // In production, this would call an API endpoint
      // await systemAPI.updateSettings(systemSettings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSuccess('System settings saved successfully!');
    } catch (err) {
      setError('Failed to save system settings');
    } finally {
      setLoading(false);
    }
  };

  const saveBarangaySettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await barangayAPI.updateSettings(barangaySettings);
      setSuccess('Barangay information saved successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save barangay information');
    } finally {
      setLoading(false);
    }
  };

  const addDepartment = async () => {
    if (!newDepartment.trim()) return;
    
    if (!barangayId) {
      setError('Barangay information not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await departmentAPI.create({ 
        name: newDepartment,
        barangayId: barangayId 
      });
      setNewDepartment('');
      setSuccess('Department added successfully!');
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add department');
    } finally {
      setLoading(false);
    }
  };

  const updateDepartment = async (id, name) => {
    setLoading(true);
    setError('');
    
    try {
      await departmentAPI.update(id, { name });
      setEditingDept(null);
      setSuccess('Department updated successfully!');
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update department');
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (id) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    setLoading(true);
    setError('');
    
    try {
      await departmentAPI.delete(id);
      setSuccess('Department deleted successfully!');
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete department');
    } finally {
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
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Configure system preferences and information</p>
          </div>
        </header>

        <div className="p-8">
          <div className="max-w-5xl mx-auto">
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                <Save size={18} className="mr-2" />
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* System Configuration Tab */}
            {activeTab === 'system' && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">System Configuration</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock size={16} className="inline mr-2" />
                        Attendance Cutoff Time
                      </label>
                      <input
                        type="time"
                        value={systemSettings.cutoffTime}
                        onChange={(e) => setSystemSettings({...systemSettings, cutoffTime: e.target.value})}
                        className="input-field"
                      />
                      <p className="text-xs text-gray-500 mt-1">Late after this time</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grace Period (minutes)
                      </label>
                      <input
                        type="number"
                        value={systemSettings.gracePeriod}
                        onChange={(e) => setSystemSettings({...systemSettings, gracePeriod: parseInt(e.target.value)})}
                        className="input-field"
                        min="0"
                        max="60"
                      />
                      <p className="text-xs text-gray-500 mt-1">Allowance before marking as late</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shift Start Time
                      </label>
                      <input
                        type="time"
                        value={systemSettings.shiftStart}
                        onChange={(e) => setSystemSettings({...systemSettings, shiftStart: e.target.value})}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shift End Time
                      </label>
                      <input
                        type="time"
                        value={systemSettings.shiftEnd}
                        onChange={(e) => setSystemSettings({...systemSettings, shiftEnd: e.target.value})}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Working Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <label key={day} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={systemSettings.workingDays.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSystemSettings({
                                  ...systemSettings,
                                  workingDays: [...systemSettings.workingDays, day]
                                });
                              } else {
                                setSystemSettings({
                                  ...systemSettings,
                                  workingDays: systemSettings.workingDays.filter(d => d !== day)
                                });
                              }
                            }}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={saveSystemSettings}
                    disabled={loading}
                    className="btn-primary"
                  >
                    <Save size={16} className="inline mr-2" />
                    {loading ? 'Saving...' : 'Save System Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Barangay Information Tab */}
            {activeTab === 'barangay' && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Barangay Information</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building2 size={16} className="inline mr-2" />
                      Barangay Name
                    </label>
                    <input
                      type="text"
                      value={barangaySettings.name}
                      onChange={(e) => setBarangaySettings({...barangaySettings, name: e.target.value})}
                      className="input-field"
                      placeholder="Barangay Maharlika"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} className="inline mr-2" />
                      Address
                    </label>
                    <textarea
                      value={barangaySettings.address}
                      onChange={(e) => setBarangaySettings({...barangaySettings, address: e.target.value})}
                      className="input-field"
                      rows="3"
                      placeholder="Enter complete address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone size={16} className="inline mr-2" />
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        value={barangaySettings.contactNumber}
                        onChange={(e) => setBarangaySettings({...barangaySettings, contactNumber: e.target.value})}
                        className="input-field"
                        placeholder="+63 912 345 6789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail size={16} className="inline mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={barangaySettings.email}
                        onChange={(e) => setBarangaySettings({...barangaySettings, email: e.target.value})}
                        className="input-field"
                        placeholder="barangay@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Barangay Captain
                    </label>
                    <input
                      type="text"
                      value={barangaySettings.captain}
                      onChange={(e) => setBarangaySettings({...barangaySettings, captain: e.target.value})}
                      className="input-field"
                      placeholder="Hon. Juan Dela Cruz"
                    />
                  </div>

                  <button
                    onClick={saveBarangaySettings}
                    disabled={loading}
                    className="btn-primary"
                  >
                    <Save size={16} className="inline mr-2" />
                    {loading ? 'Saving...' : 'Save Barangay Information'}
                  </button>
                </div>
              </div>
            )}

            {/* Departments Tab */}
            {activeTab === 'departments' && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Department Management</h3>
                
                {/* Add New Department */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add New Department
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      className="input-field flex-1"
                      placeholder="Department name"
                      onKeyPress={(e) => e.key === 'Enter' && addDepartment()}
                    />
                    <button
                      onClick={addDepartment}
                      disabled={loading || !newDepartment.trim()}
                      className="btn-primary disabled:opacity-50"
                    >
                      <Plus size={16} className="inline mr-2" />
                      Add
                    </button>
                  </div>
                </div>

                {/* Department List */}
                <div className="space-y-3">
                  {departments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users size={48} className="mx-auto mb-3 text-gray-300" />
                      <p>No departments yet</p>
                      <p className="text-sm mt-1">Add your first department above</p>
                    </div>
                  ) : (
                    departments.map((dept) => (
                      <div
                        key={dept.id}
                        className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {editingDept === dept.id ? (
                          <input
                            type="text"
                            defaultValue={dept.name}
                            autoFocus
                            onBlur={(e) => updateDepartment(dept.id, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                updateDepartment(dept.id, e.target.value);
                              }
                            }}
                            className="input-field flex-1 mr-3"
                          />
                        ) : (
                          <div className="flex items-center space-x-3">
                            <Building2 size={18} className="text-blue-600" />
                            <span className="font-medium text-gray-800">{dept.name}</span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingDept(dept.id)}
                            className="p-2 text-gray-700 hover:bg-[#C4B4AE] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteDepartment(dept.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
