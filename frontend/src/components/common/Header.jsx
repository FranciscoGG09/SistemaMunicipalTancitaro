import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip
} from '@mui/material';
import { Logout, Person } from '@mui/icons-material';

const Header = () => {
  const { user, logout } = useAuth();

  const getRoleColor = (rol) => {
    switch (rol) {
      case 'admin': return 'error';
      case 'trabajador': return 'primary';
      case 'ciudadano': return 'success';
      default: return 'default';
    }
  };

  return (
    <AppBar
      position="fixed"
      className="app-header"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar>
        <img src="/logo192.png" alt="Logo" style={{ height: '40px', marginRight: '1rem' }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Sistema Municipal Tancítaro
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person />
            <Typography variant="body2">
              {user?.nombre}
            </Typography>
            <Chip
              label={user?.rol}
              color={getRoleColor(user?.rol)}
              size="small"
            />
          </Box>
          <Button
            color="inherit"
            onClick={logout}
            startIcon={<Logout />}
            sx={{ border: '1px solid rgba(255,255,255,0.3)' }}
          >
            Salir
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;