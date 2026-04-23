import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import Bookings from './pages/Bookings';
import SelectBarber from './pages/SelectBarber';
import ConfirmBooking from './pages/ConfirmBooking';
import Payment from './pages/Payment';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import AdminServices from './pages/AdminServices';
import AdminBarbers from './pages/AdminBarbers';
import AdminSettings from './pages/AdminSettings';
import ProfilePage from './pages/ProfilePage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
            <Route path="/barbers" element={<ProtectedRoute><SelectBarber /></ProtectedRoute>} />
            <Route path="/confirm-booking" element={<ProtectedRoute><ConfirmBooking /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute allowedRoles={['admin']}><AdminServices /></ProtectedRoute>} />
            <Route path="/admin/barbers" element={<ProtectedRoute allowedRoles={['admin']}><AdminBarbers /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <div className="container">
                  <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
                  <div className="card">
                    <p>Welcome to your elite dashboard. Your session is active.</p>
                  </div>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
