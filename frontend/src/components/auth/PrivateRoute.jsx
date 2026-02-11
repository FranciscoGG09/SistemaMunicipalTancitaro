import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const hasPermission = Array.isArray(requiredRole)
      ? requiredRole.includes(user.rol)
      : user.rol === requiredRole;

    if (!hasPermission) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <Typography variant="h4" color="error" gutterBottom>
            ⚠️ Acceso Denegado
          </Typography>
          <Typography variant="body1">
            No tienes permisos para acceder a esta página.
          </Typography>
        </Box>
      );
    }

    return children;
  };

  return children;
};

export default PrivateRoute;