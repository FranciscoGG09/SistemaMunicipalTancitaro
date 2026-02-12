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
import { reportsAPI, newsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReportMap from '../components/dashboard/ReportMap';

const Dashboard = () => {
  const { user } = useAuth();
  const [statsData, setStatsData] = React.useState({
    total: 0,
    recibidos: 0,
    enProceso: 0,
    concluidos: 0
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await reportsAPI.getStats();
        const stats = response.data.estadisticas || [];

        let total = 0;
        let recibidos = 0;
        let enProceso = 0;
        let concluidos = 0;

        stats.forEach(item => {
          const count = parseInt(item.cantidad);
          total += count;
          if (item.estado === 'recibido') recibidos += count;
          if (item.estado === 'en_proceso') enProceso += count;
          if (item.estado === 'concluido') concluidos += count;
        });

        setStatsData({ total, recibidos, enProceso, concluidos });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  // Define stats based on role
  const getStats = () => {
    switch (user?.rol) {
      case 'admin':
        return [
          { title: 'Reportes Totales', value: statsData.total, icon: <ReportIcon fontSize="large" />, color: '#3b82f6' },
          { title: 'En Proceso', value: statsData.enProceso, icon: <ReportIcon fontSize="large" />, color: '#f59e0b' },
          { title: 'Concluidos', value: statsData.concluidos, icon: <ReportIcon fontSize="large" />, color: '#10b981' },
          // Placeholder for other global stats not yet in API
          { title: 'Usuarios', value: '...', icon: <PeopleIcon fontSize="large" />, color: '#8b5cf6' },
        ];
      case 'trabajador':
        return [
          { title: 'Reportes Depto', value: statsData.total, icon: <ReportIcon fontSize="large" />, color: '#3b82f6' },
          { title: 'En Proceso', value: statsData.enProceso, icon: <ReportIcon fontSize="large" />, color: '#f59e0b' },
          { title: 'Concluidos', value: statsData.concluidos, icon: <ReportIcon fontSize="large" />, color: '#10b981' },
        ];
      case 'comunicacion_social':
        return [
          { title: 'Noticias Totales', value: '...', icon: <NewsIcon fontSize="large" />, color: '#8b5cf6' },
        ];
      case 'ciudadano':
        return [
          { title: 'Mis Reportes', value: statsData.total, icon: <ReportIcon fontSize="large" />, color: '#3b82f6' },
          { title: 'Resueltos', value: statsData.concluidos, icon: <ReportIcon fontSize="large" />, color: '#10b981' },
        ];
      default:
        return [];
    }
  };

  const getWelcomeMessage = () => {
    if (user?.rol === 'admin') return 'Panel de control principal - Vista de Administrador';
    if (user?.rol === 'trabajador') return `Panel de trabajo - Departamento: ${user.departamento || 'General'}`;
    if (user?.rol === 'comunicacion_social') return 'Panel de Comunicación Social';
    return 'Bienvenido ciudadano. Aquí puedes ver el estado de tus reportes.';
  };

  const stats = getStats();

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: 'var(--primary-blue)' }}>
        📊 Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        {getWelcomeMessage()}
      </Typography>

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${stat.color}10 0%, ${stat.color}20 100%)`,
                borderLeft: `4px solid ${stat.color}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
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
                  <Typography variant="h6" component="div" sx={{ fontSize: '1rem' }}>
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" fontWeight="bold" color={stat.color}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Mapa de Reportes */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          {/* Lazy load or just import if possible. For now assuming import at top */}
          <ReportMap />
        </Grid>
      </Grid>

      {/* Contenido adicional basado en rol */}
      <Grid container spacing={3}>
        {['admin', 'trabajador'].includes(user?.rol) && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">
                🚀 Actividad Reciente
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • Nuevo reporte en Obras Públicas (Hace 10 min) <br />
                • Reporte #123 marcado como concluido (Hace 1 hora) <br />
                • Usuario registrado (Hace 2 horas)
              </Typography>
            </Paper>
          </Grid>
        )}

        {user?.rol === 'admin' && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">
                📈 Resumen Global
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Reportes totales del mes: 45 <br />
                Eficiencia de resolución: 85%
              </Typography>
            </Paper>
          </Grid>
        )}

        {user?.rol === 'ciudadano' && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                📢 Noticias Recientes
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Mantente informado de lo que sucede en tu municipio. Ve a la sección de Noticias para más detalles.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;