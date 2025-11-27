import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const Reports = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        📋 Gestión de Reportes
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Esta sección estará disponible pronto. Aquí podrás:
        </Typography>
        <ul>
          <li>Ver todos los reportes ciudadanos</li>
          <li>Filtrar reportes por categoría y estado</li>
          <li>Actualizar el estado de los reportes</li>
          <li>Ver estadísticas detalladas</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default Reports;