import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  LayoutDashboard, 
  ClipboardCheck, 
  Settings, 
  LogOut,
  Menu,
  X,
  QrCode,
  Calendar
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { userAPI, attendanceAPI } from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('today'); // 'today' or 'date'

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate, viewMode]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all users (excluding admins)
      const usersResponse = await userAPI.getAll({ limit: 1000 });
      const allUsers = usersResponse.data.data || [];
      const employees = allUsers.filter(user => user.role !== 'ADMIN' && user.isActive);
      
      // Fetch attendance based on view mode
      let attendanceResponse;
      if (viewMode === 'today') {
        attendanceResponse = await attendanceAPI.getToday();
      } else {
        attendanceResponse = await attendanceAPI.getAll({ 
          date: selectedDate,
          limit: 100
        });
      }
      
      const attendanceRecords = attendanceResponse.data.data || [];
      
      // Calculate stats
      const totalEmployees = employees.length;
      const present = attendanceRecords.length;
      const absent = totalEmployees - present;
      
      setStats({
        totalEmployees,
        present,
        absent
      });
      
      setAttendanceData(attendanceRecords);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate chart data from real attendance
  const getStatusData = () => {
    if (attendanceData.length === 0) return [];
    
    const statusCounts = attendanceData.reduce((acc, record) => {
      const status = record.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const colors = {
      'ON_TIME': '#10b981',
      'LATE': '#f59e0b',
      'ABSENT': '#ef4444',
      'UNKNOWN': '#6b7280'
    };
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' '),
      value: count,
      color: colors[status] || '#6b7280'
    }));
  };

  const statusData = getStatusData();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: UserPlus, label: 'Register Employee', path: '/register' },
    { icon: Users, label: 'User Management', path: '/users' },
    { icon: ClipboardCheck, label: 'Attendance', path: '/attendance' },
    { icon: QrCode, label: 'QR Card Manager', path: '/qr-manager' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    // Clear auth token and redirect
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col`} style={{ backgroundColor: '#DECACA' }}>
        {/* Logo Section */}
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

        {/* Navigation Menu */}
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

        {/* Logout Button */}
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
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-800">Barangay Official Monitoring</h1>
            <p className="text-sm text-gray-500 mt-1">QR Code Based Attendance Monitoring System with Historical Tracking</p>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Date Filter Bar */}
              <div className="card mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-800">Attendance Overview</h2>
                    
                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('today')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          viewMode === 'today' 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        Today
                      </button>
                      <button
                        onClick={() => setViewMode('date')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          viewMode === 'date' 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        Select Date
                      </button>
                    </div>
                  </div>

                  {/* Date Display/Picker */}
                  {viewMode === 'today' ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={20} />
                      <span className="font-medium">{new Date().toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                        <Calendar size={18} />
                        Date:
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Employees */}
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-2">Total Employees</p>
                      <h3 className="text-4xl font-bold">{stats.totalEmployees}</h3>
                    </div>
                    <div className="bg-white p-4 rounded-full shadow-md">
                      <Users size={36} className="text-blue-600" strokeWidth={3} />
                    </div>
                  </div>
                </div>

                {/* Present */}
                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium mb-2">Present Today</p>
                      <h3 className="text-4xl font-bold">{stats.present}</h3>
                    </div>
                    <div className="bg-white p-4 rounded-full shadow-md">
                      <CheckCircle size={36} className="text-green-600" strokeWidth={3} />
                    </div>
                  </div>
                </div>

                {/* Absent */}
                <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium mb-2">Absent Today</p>
                      <h3 className="text-4xl font-bold">{stats.absent}</h3>
                    </div>
                    <div className="bg-white p-4 rounded-full shadow-md">
                      <XCircle size={36} className="text-red-600" strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Status Today */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">Attendance Status Today</h3>
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>No attendance data yet</p>
                    </div>
                  )}
                </div>

                {/* Attendance Overview */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">Attendance Overview</h3>
                  {stats.totalEmployees > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Present', value: stats.present, color: '#10b981' },
                            { name: 'Absent', value: stats.absent, color: '#ef4444' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>No employees registered yet</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
