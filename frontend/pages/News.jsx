import React from 'react';
import { Typography, Paper, Box, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const News = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <Alert severity="warning">
        Solo los administradores pueden acceder a la gestión de noticias.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        📰 Gestión de Noticias
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Panel de administración para publicar noticias municipales.
        </Typography>
        <ul>
          <li>Crear y publicar noticias</li>
          <li>Gestionar noticias existentes</li>
          <li>Destacar noticias prioritarias</li>
          <li>Agregar enlaces a redes sociales</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default News;