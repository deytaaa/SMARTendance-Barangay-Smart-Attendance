import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  LayoutDashboard, 
  ClipboardCheck, 
  Settings, 
  LogOut,
  Menu,
  X,
  QrCode,
  Download,
  RefreshCw,
  Eye,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { qrAPI } from '../services/api';

function QRManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [qrCards, setQrCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingCardId, setGeneratingCardId] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    withCards: 0,
    withoutCards: 0
  });

  useEffect(() => {
    fetchQRCards();
  }, []);

  const fetchQRCards = async () => {
    try {
      setLoading(true);
      const response = await qrAPI.getAll();
      const cards = response.data.data || [];
      
      setQrCards(cards);
      setStats({
        total: cards.length,
        withCards: cards.filter(card => card.hasQRCard).length,
        withoutCards: cards.filter(card => !card.hasQRCard).length
      });
    } catch (error) {
      console.error('Error fetching QR cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAllCards = async () => {
    try {
      setGenerating(true);
      await qrAPI.generate();
      
      // Refresh the list after generation
      await fetchQRCards();
      
      alert('✅ QR cards generated successfully!');
    } catch (error) {
      console.error('Error generating QR cards:', error);
      alert('❌ Failed to generate QR cards. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const generateSingleCard = async (userId) => {
    try {
      setGeneratingCardId(userId);
      await qrAPI.generateOne(userId);
      await fetchQRCards();
      alert('✅ QR card generated successfully!');
    } catch (error) {
      console.error('Error generating QR card:', error);
      alert('❌ Failed to generate QR card. Please try again.');
    } finally {
      setGeneratingCardId(null);
    }
  };

  const downloadCard = async (userId, name) => {
    try {
      const response = await qrAPI.download(userId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr_card_${userId}_${name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR card:', error);
      alert('❌ Failed to download QR card. Please ensure it exists.');
    }
  };

  const viewCard = async (userId) => {
    try {
      const response = await qrAPI.download(userId);
      const blob = new Blob([response.data], { type: 'image/png' });
      const imageUrl = window.URL.createObjectURL(blob);
      
      setSelectedCard({
        userId,
        imageUrl,
        ...qrCards.find(card => card.userId === userId)
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error viewing QR card:', error);
      alert('❌ Failed to load QR card preview.');
    }
  };

  const closeModal = () => {
    if (selectedCard?.imageUrl) {
      window.URL.revokeObjectURL(selectedCard.imageUrl);
    }
    setSelectedCard(null);
    setShowModal(false);
  };

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: UserPlus, label: 'Enroll Employee', path: '/register' },
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

  const getCardIcon = (hasCard) => {
    return hasCard ? (
      <UserCheck className="text-green-600" size={24} />
    ) : (
      <AlertCircle className="text-yellow-600" size={24} />
    );
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

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center ${sidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#C4B4AE] text-black font-medium shadow-sm' 
                    : 'hover:bg-[#C4B4AE] hover:text-black'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
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
            <h1 className="text-2xl font-bold text-gray-800">QR Card Manager</h1>
            <p className="text-sm text-gray-500 mt-1">Manage employee QR attendance cards</p>
          </div>
        </header>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading QR cards...</p>
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Total Employees</p>
                      <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                    </div>
                    <Users className="text-blue-600" size={32} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">With QR Cards</p>
                      <h3 className="text-2xl font-bold text-green-600">{stats.withCards}</h3>
                    </div>
                    <UserCheck className="text-green-600" size={32} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Missing QR Cards</p>
                      <h3 className="text-2xl font-bold text-yellow-600">{stats.withoutCards}</h3>
                    </div>
                    <AlertCircle className="text-yellow-600" size={32} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <button
                    onClick={generateAllCards}
                    disabled={generating}
                    className="w-full h-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                  >
                    {generating ? (
                      <RefreshCw className="animate-spin" size={20} />
                    ) : (
                      <QrCode size={20} />
                    )}
                    <span className="font-medium">
                      {generating ? 'Generating...' : 'Generate All Cards'}
                    </span>
                  </button>
                </div>
              </div>

              {/* QR Cards Grid */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Employee QR Cards</h2>
                  
                  {qrCards.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <QrCode size={64} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No employees found</p>
                      <p>Enroll employees to generate QR cards</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {qrCards.map((card) => (
                        <div key={card.userId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{card.name}</h3>
                              <p className="text-sm text-gray-600">{card.role}</p>
                              <p className="text-xs text-gray-500">{card.department}</p>
                              <p className="text-xs text-gray-400 mt-1">ID: {card.userId}</p>
                            </div>
                            {getCardIcon(card.hasQRCard)}
                          </div>

                          <div className="flex space-x-2">
                            {card.hasQRCard ? (
                              <>
                                <button
                                  onClick={() => viewCard(card.userId)}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                                >
                                  <Eye size={16} />
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={() => downloadCard(card.userId, card.name)}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                                >
                                  <Download size={16} />
                                  <span>Download</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => generateSingleCard(card.userId)}
                                disabled={generating || generatingCardId === card.userId}
                                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                              >
                                {generatingCardId === card.userId ? (
                                  <RefreshCw className="animate-spin" size={16} />
                                ) : (
                                  <QrCode size={16} />
                                )}
                                <span>{generatingCardId === card.userId ? 'Generating...' : 'Generate Card'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* QR Card Preview Modal */}
      {showModal && selectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(6px)', background: 'rgba(16, 24, 40, 0.55)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#1f2937 0%,#374151 100%)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/15 ring-2 ring-white/25 flex items-center justify-center overflow-hidden">
                  {selectedCard.profileImage ? (
                    <img src={selectedCard.profileImage} alt={selectedCard.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-sm">{getInitials(selectedCard.name)}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-white text-lg font-semibold leading-tight">QR Card Preview</h3>
                  <p className="text-white/75 text-xs">{selectedCard.name}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
                <img
                  src={selectedCard.imageUrl}
                  alt={`QR Card for ${selectedCard.name}`}
                  className="w-full border border-gray-200 rounded-lg shadow-sm"
                />
              </div>

              <button
                onClick={() => downloadCard(selectedCard.userId, selectedCard.name)}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Download size={16} />
                <span>Download QR Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QRManager;