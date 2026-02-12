import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Box, Alert, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  Card, CardContent, CardActions, Chip, Grid
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

import { newsAPI } from '../services/api';

const News = () => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentNews, setCurrentNews] = useState({ titulo: '', contenido: '' });
  const [loading, setLoading] = useState(false);

  // Check permissions: Admin or ComSoc
  const canManage = ['admin', 'comunicacion_social'].includes(user?.rol);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await newsAPI.getAll();
      setNews(response.data.noticias || response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      await newsAPI.create(currentNews);
      setOpen(false);
      fetchNews();
      setCurrentNews({ titulo: '', contenido: '' });
    } catch (error) {
      console.error('Error creating news:', error);
      alert('Error creando noticia');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta noticia?')) {
      try {
        await newsAPI.delete(id);
        fetchNews();
      } catch (error) {
        console.error('Error deleting news:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: 'var(--primary-blue)' }}>
          📰 Noticias Municipales
        </Typography>
        {canManage && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{ backgroundColor: 'var(--primary-blue)' }}
          >
            Nueva Noticia
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {news.map((item) => (
          <Grid item xs={12} md={6} key={item.id}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  {item.titulo}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {new Date(item.creado_en || Date.now()).toLocaleDateString()}
                </Typography>
                <Typography variant="body1">
                  {item.contenido}
                </Typography>
              </CardContent>
              {canManage && (
                <CardActions>
                  {/* Edit functionality to be implemented if needed */}
                  <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleDelete(item.id)}>Eliminar</Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal Create/Edit */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nueva Noticia</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Título"
            value={currentNews.titulo}
            onChange={(e) => setCurrentNews({ ...currentNews, titulo: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Contenido"
            multiline
            rows={4}
            value={currentNews.contenido}
            onChange={(e) => setCurrentNews({ ...currentNews, contenido: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} variant="contained" disabled={loading}>Publicar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default News;