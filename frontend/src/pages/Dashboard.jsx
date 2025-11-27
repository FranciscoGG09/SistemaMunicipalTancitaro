import React from 'react';
import { 
  Typography, 
  Paper, 
  Grid, 
  Box,
  Card,
  CardContent 
} from '@mui/material';
import {
  Report as ReportIcon,
  Article as NewsIcon,
  People as PeopleIcon,
  Email as EmailIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const stats = [
    { 
      title: 'Reportes Activos', 
      value: '12', 
      icon: <ReportIcon fontSize="large" />,
      color: '#3b82f6'
    },
    { 
      title: 'Noticias Publicadas', 
      value: '5', 
      icon: <NewsIcon fontSize="large" />,
      color: '#8b5cf6'
    },
    { 
      title: 'Usuarios Registrados', 
      value: '24', 
      icon: <PeopleIcon fontSize="large" />,
      color: '#10b981'
    },
    { 
      title: 'Correos No Leídos', 
      value: '3', 
      icon: <EmailIcon fontSize="large" />,
      color: '#f59e0b'
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        📊 Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Bienvenido al Sistema Municipal de Tancítaro - Panel de control principal
      </Typography>
      
      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}40 100%)`,
                border: `1px solid ${stat.color}30`
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      color: stat.color,
                      mr: 2
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" fontWeight="bold" color={stat.color}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Contenido adicional */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🚀 Actividad Reciente
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Aquí se mostrará la actividad reciente del sistema...
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📈 Reportes por Categoría
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Gráfico de reportes por categoría...
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;