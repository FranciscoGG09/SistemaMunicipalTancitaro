import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Button, Dialog, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  DialogTitle, DialogContent, DialogActions, TextField, Grid
} from '@mui/material';
import { Add, Delete, Visibility } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { newsAPI } from '../services/api';

const News = () => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [currentNews, setCurrentNews] = useState({ titulo: '', contenido: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleOpenCreate = () => {
    setCurrentNews({ titulo: '', contenido: '' });
    setImageFile(null);
    setImagePreview(null);
    setOpenCreate(true);
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('titulo', currentNews.titulo);
      formData.append('contenido', currentNews.contenido);
      if (imageFile) {
        formData.append('imagen', imageFile);
      }
      await newsAPI.create(formData);
      setOpenCreate(false);
      fetchNews();
      setCurrentNews({ titulo: '', contenido: '' });
      setImageFile(null);
      setImagePreview(null);
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

  const handleViewClick = (item) => {
    setSelectedNews(item);
    setOpenView(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: 'var(--primary-blue)' }}>
          📰 Noticias Municipales
        </Typography>
        {canManage && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreate}
            sx={{ backgroundColor: 'var(--primary-blue)' }}
          >
            Nueva Noticia
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: 'var(--light-blue)' }}>
            <TableRow>
              <TableCell><strong>Título</strong></TableCell>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Autor</strong></TableCell>
              <TableCell align="center"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {news.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.titulo}</TableCell>
                <TableCell>{new Date(item.creado_en || item.publicado_en || Date.now()).toLocaleDateString()}</TableCell>
                <TableCell>{item.usuario_nombre || '-'}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" title="Ver Detalles" onClick={() => handleViewClick(item)}>
                    <Visibility />
                  </IconButton>
                  {canManage && (
                    <IconButton color="error" title="Eliminar" onClick={() => handleDelete(item.id)}>
                      <Delete />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {news.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">No hay noticias publicadas</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog View Details */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles de la Noticia</DialogTitle>
        <DialogContent dividers>
          {selectedNews && (
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {selectedNews.titulo}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Publicado: {new Date(selectedNews.creado_en || selectedNews.publicado_en || Date.now()).toLocaleDateString()}
                {selectedNews.usuario_nombre && ` • Por: ${selectedNews.usuario_nombre}`}
              </Typography>

              {/* Imagen de la noticia */}
              {selectedNews.adjuntos && selectedNews.adjuntos.length > 0 && selectedNews.adjuntos.some(a => a) && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  {selectedNews.adjuntos.filter(a => a).map((img, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={img}
                      alt={`Imagen ${index + 1}`}
                      sx={{
                        width: '100%',
                        maxHeight: 400,
                        objectFit: 'cover',
                        borderRadius: 2,
                        border: '1px solid #ddd',
                        mb: 1
                      }}
                    />
                  ))}
                </Box>
              )}

              <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                {selectedNews.contenido}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Create */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
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
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Imagen (opcional)</Typography>
            <input
              accept="image/*"
              type="file"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'cover' }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancelar</Button>
          <Button onClick={handleCreate} variant="contained" disabled={loading}>Publicar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default News;