import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { attendanceAPI, departmentAPI } from '../services/api';
import { disconnectSocket, getSocket } from '../services/socket';
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
  const { viewMode: routeViewMode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const todayDate = new Date().toISOString().split('T')[0];
  const dateParam = searchParams.get('date');
  const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
  const resolvedSelectedDate = isValidDate(dateParam) ? dateParam : todayDate;
  const [selectedDate, setSelectedDate] = useState(resolvedSelectedDate);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const viewMode = routeViewMode === 'date' ? 'date' : 'today';
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    if (routeViewMode !== 'today' && routeViewMode !== 'date') {
      navigate('/attendance/today', { replace: true });
    }
  }, [navigate, routeViewMode]);

  useEffect(() => {
    setSelectedDate(resolvedSelectedDate);
  }, [resolvedSelectedDate]);

  useEffect(() => {
    if (viewMode !== 'date') {
      if (dateParam) {
        setSearchParams({}, { replace: true });
      }
      return;
    }

    if (dateParam !== selectedDate) {
      setSearchParams({ date: selectedDate }, { replace: true });
    }
  }, [dateParam, selectedDate, setSearchParams, viewMode]);

  useEffect(() => {
    departmentAPI.getAll()
      .then(res => setDepartments(res.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when date or view changes
  }, [selectedDate, viewMode]);

  useEffect(() => {
    if (viewMode === 'today') {
      fetchTodayAttendance(currentPage);
    } else {
      fetchAttendanceByDate(currentPage);
    }
  }, [selectedDate, viewMode, currentPage, pageSize]);

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => setIsLiveConnected(true);
    const handleDisconnect = () => setIsLiveConnected(false);
    const handleAttendanceUpdated = () => {
      if (viewMode === 'today') {
        fetchTodayAttendance(false);
      } else {
        fetchAttendanceByDate(false);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('attendance:updated', handleAttendanceUpdated);

    setIsLiveConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('attendance:updated', handleAttendanceUpdated);
    };
  }, [viewMode, selectedDate]);


  const fetchTodayAttendance = async (page = 1, showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await attendanceAPI.getAll({
        date: todayDate,
        page,
        limit: pageSize
      });
      setAttendance(response.data.data || []);
      setTotalPages(response.data.pages || 1);
      setTotalRecords(response.data.total || 0);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const fetchAttendanceByDate = async (page = 1, showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await attendanceAPI.getAll({
        date: selectedDate,
        page,
        limit: pageSize
      });
      setAttendance(response.data.data || []);
      setTotalPages(response.data.pages || 1);
      setTotalRecords(response.data.total || 0);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      if (showLoader) setLoading(false);
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
    { icon: UserPlus, label: 'Enroll Employee', path: '/register' },
    { icon: Users, label: 'User Management', path: '/users' },
    { icon: ClipboardCheck, label: 'Attendance', path: '/attendance' },
    { icon: QrCode, label: 'QR Card Manager', path: '/qr-manager' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isMenuItemActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredAttendance = attendance.filter(record => {
    const fullName = `${record.user?.firstName} ${record.user?.lastName}`.toLowerCase();
    const nameMatch = fullName.includes(searchTerm.toLowerCase());
    const deptMatch = !selectedDepartment || record.user?.department?.id === parseInt(selectedDepartment);
    return nameMatch && deptMatch;
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
                    isMenuItemActive(item.path)
                      ? 'text-white shadow-lg' 
                      : 'text-black hover:bg-[#C4B4AE]'
                  }`}
                  style={isMenuItemActive(item.path) ? { backgroundColor: '#B8A09A' } : {}}
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

                {/* Department Filter */}
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-700 min-w-[180px]"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => navigate('/attendance/today')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'today' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigate(`/attendance/date?date=${selectedDate}`)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'date' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Select Date
                  </button>
                </div>

                {/* Live update controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleManualRefresh}
                    disabled={loading}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh now"
                  >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                  </button>

                  <div className={`flex items-center gap-1 text-xs ${isLiveConnected ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span>{isLiveConnected ? 'Live updates' : 'Reconnecting...'}</span>
                  </div>
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
                  <div>{totalRecords} record{totalRecords !== 1 ? 's' : ''} found</div>
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
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
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
                            {record.user?.department?.name ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                {record.user.department.name}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
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
                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-4">
                  <div className="text-xs text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="px-2 py-1 rounded border border-gray-300 text-xs"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >First</button>
                    <button
                      className="px-2 py-1 rounded border border-gray-300 text-xs"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >Prev</button>
                    <span className="px-2 py-1 text-xs border border-gray-300 rounded bg-white">{currentPage}</span>
                    <button
                      className="px-2 py-1 rounded border border-gray-300 text-xs"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >Next</button>
                    <button
                      className="px-2 py-1 rounded border border-gray-300 text-xs"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >Last</button>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span>Rows:</span>
                    <select
                      value={pageSize}
                      onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                      className="border border-gray-300 rounded px-1 py-0.5"
                    >
                      {[5, 10, 20, 50, 100].map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Attendance;
