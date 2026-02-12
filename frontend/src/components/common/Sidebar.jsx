import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as ReportIcon,
  Article as NewsIcon,
  Person as ProfileIcon,
  People as PeopleIcon
} from '@mui/icons-material';

const drawerWidth = 280;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      roles: ['admin', 'trabajador', 'ciudadano']
    },
    {
      text: 'Reportes',
      icon: <ReportIcon />,
      path: '/reportes',
      roles: ['admin', 'trabajador', 'ciudadano']
    },
    {
      text: 'Noticias',
      icon: <NewsIcon />,
      path: '/noticias',
      roles: ['admin', 'comunicacion_social']
    },
    {
      text: 'Usuarios',
      icon: <PeopleIcon />,
      path: '/usuarios',
      roles: ['admin']
    },
    {
      text: 'Mi Perfil',
      icon: <ProfileIcon />,
      path: '/perfil',
      roles: ['admin', 'trabajador', 'ciudadano']
    },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(user?.rol)
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: '#f8fafc'
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', p: 1 }}>
        <List>
          {filteredMenuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: '#2c5aa0',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  backgroundColor: '#e2e8f0',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'white' : '#64748b',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                }}
              />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />

        {/* Información del usuario */}
        <Box sx={{ p: 2, backgroundColor: '#e2e8f0', borderRadius: 2 }}>
          <Typography variant="caption" display="block" color="textSecondary">
            Conectado como:
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {user?.nombre}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {user?.rol} • {user?.departamento || 'Sin departamento'}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;