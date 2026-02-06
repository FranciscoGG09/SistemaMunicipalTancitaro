import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Box, Alert, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  Card, CardContent, CardActions, Chip, Grid
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const News = () => {
  const { user } = useAuth();
  const [news, setNews] = useState([]); // Placeholder for news list
  const [open, setOpen] = useState(false);
  const [currentNews, setCurrentNews] = useState({ title: '', content: '' });

  // Check permissions: Admin or ComSoc
  const canManage = ['admin', 'comunicacion_social'].includes(user?.rol);

  useEffect(() => {
    // Fetch news here
    // mock data
    setNews([
      { id: 1, title: 'Inauguración de Parque', content: 'Se inauguró el nuevo parque municipal...', date: '2023-10-25' },
      { id: 2, title: 'Campaña de Vacunación', content: 'Próxima semana inicia campaña...', date: '2023-10-28' }
    ]);
  }, []);

  const handleCreate = () => {
    // API call to create news
    console.log('Creating news:', currentNews);
    setOpen(false);
    // Refresh list
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
                  {item.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {item.date}
                </Typography>
                <Typography variant="body1">
                  {item.content}
                </Typography>
              </CardContent>
              {canManage && (
                <CardActions>
                  <Button size="small" startIcon={<Edit />}>Editar</Button>
                  <Button size="small" color="error" startIcon={<Delete />}>Eliminar</Button>
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
            value={currentNews.title}
            onChange={(e) => setCurrentNews({ ...currentNews, title: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Contenido"
            multiline
            rows={4}
            value={currentNews.content}
            onChange={(e) => setCurrentNews({ ...currentNews, content: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} variant="contained">Publicar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default News;