import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import { useAuth } from './contexts/AuthContext';

function RoutesWithAuth() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      {/* If logged out, show Home at root; if logged in, root redirects to Events */}
      {!isAuthenticated ? (
        <Route path="/" element={<Home />} />
      ) : (
        <Route path="/" element={<Navigate to="/events" replace />} />
      )}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id"
        element={
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute requiredRole="attendee">
            <MyBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="organizer">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/unauthorized" element={<div className="text-red-600">Unauthorized</div>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
  <Toaster position="top-right" />
        <Header />
        <main className="container mx-auto flex-1 px-4 py-6">
          <RoutesWithAuth />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
