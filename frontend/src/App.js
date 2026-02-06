import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/login';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import News from './pages/News';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import PrivateRoute from './components/auth/PrivateRoute';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import { Box, CssBaseline } from '@mui/material';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // El loading se maneja en PrivateRoute
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {user && <Header />}
      {user && <Sidebar />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: user ? 8 : 0,
          ml: user ? 0 : 0,
          minHeight: '100vh',
          backgroundColor: '#f8fafc'
        }}
      >
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" replace />}
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/reportes"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />
          <Route
            path="/noticias"
            element={
              <PrivateRoute requiredRole={['admin', 'comunicacion_social']}>
                <News />
              </PrivateRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/correos"
            element={
              <PrivateRoute requiredRole={['admin', 'trabajador']}>
                <div>Página de correos - Próximamente</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;