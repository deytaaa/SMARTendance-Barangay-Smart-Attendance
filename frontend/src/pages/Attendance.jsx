import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { attendanceAPI } from '../services/api';
import { 
  Users, 
  UserPlus, 
  LayoutDashboard, 
  ClipboardCheck, 
  Settings, 
  LogOut,
  Menu,
  X,
  Search,
  Calendar,
  QrCode,
  RefreshCw
} from 'lucide-react';

function Attendance() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('today'); // 'today' or 'date'
  const [autoRefresh, setAutoRefresh] = useState(true); // Auto-refresh enabled by default
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (viewMode === 'today') {
      fetchTodayAttendance();
    } else {
      fetchAttendanceByDate();
    }
  }, [selectedDate, viewMode]);

  // Auto-refresh interval - refreshes every 5 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (viewMode === 'today') {
        fetchTodayAttendance();
      } else {
        fetchAttendanceByDate();
      }
      setLastRefresh(new Date());
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, viewMode, selectedDate]);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getToday();
      setAttendance(response.data.data || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceByDate = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getAll({ 
        date: selectedDate,
        limit: 100 // Get more records for historical view
      });
      setAttendance(response.data.data || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    if (viewMode === 'today') {
      fetchTodayAttendance();
    } else {
      fetchAttendanceByDate();
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: UserPlus, label: 'Register Employee', path: '/register' },
    { icon: Users, label: 'User Management', path: '/users' },
    { icon: ClipboardCheck, label: 'Attendance', path: '/attendance' },
    { icon: QrCode, label: 'QR Card Manager', path: '/qr-manager' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredAttendance = attendance.filter(record => {
    const fullName = `${record.user?.firstName} ${record.user?.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
            <h1 className="text-2xl font-bold text-gray-800">Attendance Monitoring</h1>
            <p className="text-sm text-gray-500 mt-1">View attendance records by day with historical tracking</p>
          </div>
        </header>

        <div className="p-8">
          {/* Search & Date Filter Bar */}
          <div className="card mb-6">
            <div className="space-y-4">
              {/* Top Row: Search and View Mode Toggle */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('today')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'today' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setViewMode('date')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'date' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Select Date
                  </button>
                </div>

                {/* Auto-refresh Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleManualRefresh}
                    disabled={loading}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh now"
                  >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                  </button>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">Auto-refresh</span>
                  </label>
                  
                  {autoRefresh && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Row: Date Information/Picker */}
              <div className="flex items-center justify-between">
                {viewMode === 'today' ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={20} />
                    <span className="font-medium">Today - {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-gray-700 font-medium">
                      <Calendar size={20} />
                      Select Date:
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <span className="text-sm text-gray-500">
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
                
                <div className="text-sm text-gray-500">
                  <div>{attendance.length} record{attendance.length !== 1 ? 's' : ''} found</div>
                  <div className="text-xs mt-1">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="card">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : filteredAttendance.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No attendance records found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Check In</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Check Out</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map((record) => (
                      <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {record.user?.firstName} {record.user?.lastName}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{record.user?.role}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {record.checkInTime ? formatTime(record.checkInTime) : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {record.checkOutTime ? formatTime(record.checkOutTime) : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            record.status === 'ON_TIME' 
                              ? 'bg-green-100 text-green-700' 
                              : record.status === 'LATE'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Attendance;
