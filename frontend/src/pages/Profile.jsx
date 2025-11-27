import React from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  Avatar,
  Chip 
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Person, Email, Work, CalendarToday } from '@mui/icons-material';

const Profile = () => {
  const { user } = useAuth();

  const getRoleColor = (rol) => {
    switch (rol) {
      case 'admin': return 'error';
      case 'trabajador': return 'primary';
      case 'ciudadano': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        👤 Mi Perfil
      </Typography>
      
      <Paper sx={{ p: 4, maxWidth: 600 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{ 
              width: 80, 
              height: 80, 
              mr: 3,
              bgcolor: '#2c5aa0',
              fontSize: '2rem'
            }}
          >
            {user?.nombre?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {user?.nombre}
            </Typography>
            <Chip 
              label={user?.rol} 
              color={getRoleColor(user?.rol)}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Email sx={{ mr: 2, color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="textSecondary">
                Email
              </Typography>
              <Typography variant="body1">
                {user?.email}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Work sx={{ mr: 2, color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="textSecondary">
                Departamento
              </Typography>
              <Typography variant="body1">
                {user?.departamento || 'No asignado'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Person sx={{ mr: 2, color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="textSecondary">
                Rol en el sistema
              </Typography>
              <Typography variant="body1">
                {user?.rol === 'admin' && 'Administrador - Acceso completo'}
                {user?.rol === 'trabajador' && 'Trabajador Municipal - Gestión de reportes'}
                {user?.rol === 'ciudadano' && 'Ciudadano - Reportes y consultas'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;