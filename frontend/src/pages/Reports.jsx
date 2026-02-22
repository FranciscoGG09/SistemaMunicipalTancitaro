import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, TextField, Button, Grid
} from '@mui/material';
import { Edit, Visibility, Add, Delete } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  // New Report State
  const [newReport, setNewReport] = useState({
    titulo: '',
    categoria: '',
    descripcion: '',
    latitud: '',
    longitud: '',
    files: []
  });

  const canUpdate = ['admin', 'trabajador'].includes(user?.rol);
  const canCreate = ['admin', 'ciudadano'].includes(user?.rol);
  const canDelete = user?.rol === 'admin';

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await reportsAPI.getAll();
      setReports(response.data.reportes || response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleCreateClick = () => {
    setNewReport({
      titulo: '',
      categoria: '',
      descripcion: '',
      latitud: '',
      longitud: '',
      files: []
    });
    setOpenCreate(true);
  };

  const handleFileChange = (e) => {
    setNewReport({ ...newReport, files: e.target.files });
  };

  const handleSaveCreate = async () => {
    try {
      const formData = new FormData();
      formData.append('titulo', newReport.titulo);
      formData.append('categoria', newReport.categoria);
      formData.append('descripcion', newReport.descripcion);
      if (newReport.latitud) formData.append('latitud', newReport.latitud);
      if (newReport.longitud) formData.append('longitud', newReport.longitud);

      if (newReport.files) {
        for (let i = 0; i < newReport.files.length; i++) {
          formData.append('fotos', newReport.files[i]);
        }
      }

      await reportsAPI.create(formData);
      setOpenCreate(false);
      fetchReports();
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Error creando reporte');
    }
  };

  const handleUpdateClick = (report) => {
    setSelectedReport(report);
    setNewStatus(report.estado);
    setOpenUpdate(true);
  };

  const handleSaveUpdate = async () => {
    try {
      await reportsAPI.update(selectedReport.id, {
        estado: newStatus,
        notas: notes
      });
      setOpenUpdate(false);
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const handleViewClick = (report) => {
    setSelectedReport(report);
    setOpenView(true);
  };

  const handleDeleteClick = async (report) => {
    if (window.confirm(`¿Estás seguro de eliminar el reporte "${report.titulo}"?`)) {
      try {
        await reportsAPI.delete(report.id);
        fetchReports();
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Error eliminando reporte');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'recibido': return 'warning';
      case 'en_proceso': return 'info';
      case 'concluido': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: 'var(--primary-blue)' }}>
          📋 Reportes Ciudadanos
        </Typography>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateClick}
            sx={{ backgroundColor: 'var(--primary-blue)' }}
          >
            Nuevo Reporte
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: 'var(--light-blue)' }}>
            <TableRow>
              <TableCell><strong>Título</strong></TableCell>
              <TableCell><strong>Categoría</strong></TableCell>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Estatus</strong></TableCell>
              <TableCell align="center"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.titulo}</TableCell>
                <TableCell>{report.categoria}</TableCell>
                <TableCell>{new Date(report.creado_en).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip label={(report.estado || 'recibido').replace('_', ' ')} color={getStatusColor(report.estado)} size="small" />
                </TableCell>
                <TableCell align="center">
                  <IconButton color="primary" title="Ver Detalles" onClick={() => handleViewClick(report)}>
                    <Visibility />
                  </IconButton>
                  {canUpdate && (
                    <IconButton color="secondary" title="Actualizar Estatus" onClick={() => handleUpdateClick(report)}>
                      <Edit />
                    </IconButton>
                  )}
                  {canDelete && (
                    <IconButton color="error" title="Eliminar Reporte" onClick={() => handleDeleteClick(report)}>
                      <Delete />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog View Details */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles del Reporte</DialogTitle>
        <DialogContent dividers>
          {selectedReport && (
            <Box>
              <Typography variant="h6">{selectedReport.titulo}</Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Categoría: {selectedReport.categoria}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Estado: <Chip label={(selectedReport.estado || 'recibido').replace('_', ' ')} color={getStatusColor(selectedReport.estado)} size="small" />
              </Typography>
              <Typography variant="body1" paragraph sx={{ mt: 1 }}>
                {selectedReport.descripcion || 'Sin descripción'}
              </Typography>

              {/* Fotos del reporte */}
              {selectedReport.fotos && selectedReport.fotos.length > 0 && selectedReport.fotos.some(f => f) && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    📷 Evidencia Fotográfica
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedReport.fotos.filter(f => f).map((foto, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box
                          component="img"
                          src={foto}
                          alt={`Evidencia ${index + 1}`}
                          sx={{
                            width: '100%',
                            maxHeight: 300,
                            objectFit: 'cover',
                            borderRadius: 2,
                            border: '1px solid #ddd'
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Mapa de ubicación */}
              {selectedReport.latitud && selectedReport.longitud && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    📍 Ubicación del Reporte
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Coordenadas: {Number(selectedReport.latitud).toFixed(5)}, {Number(selectedReport.longitud).toFixed(5)}
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: 300,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid #ddd'
                    }}
                  >
                    <iframe
                      title="Ubicación del reporte"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(selectedReport.longitud) - 0.005},${Number(selectedReport.latitud) - 0.005},${Number(selectedReport.longitud) + 0.005},${Number(selectedReport.latitud) + 0.005}&layer=mapnik&marker=${Number(selectedReport.latitud)},${Number(selectedReport.longitud)}`}
                      allowFullScreen
                    />
                  </Box>
                </Box>
              )}

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                Historial de Estatus
              </Typography>
              <ul>
                {selectedReport.historial_estados && Array.isArray(selectedReport.historial_estados) ? (
                  selectedReport.historial_estados.map((h, i) => (
                    <li key={i}>
                      <strong>{h.estado}</strong>: {new Date(h.fecha).toLocaleString()}
                      {h.notas && <span> - {h.notas}</span>}
                    </li>
                  ))
                ) : (
                  <li><strong>creado:</strong> {new Date(selectedReport.creado_en).toLocaleString()}</li>
                )}
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Update Status */}
      <Dialog open={openUpdate} onClose={() => setOpenUpdate(false)}>
        <DialogTitle>Actualizar Estatus</DialogTitle>
        <DialogContent sx={{ minWidth: 400, mt: 2 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Estatus</InputLabel>
            <Select
              value={newStatus}
              label="Estatus"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="recibido">Recibido</MenuItem>
              <MenuItem value="en_proceso">En Proceso</MenuItem>
              <MenuItem value="concluido">Concluido</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Notas de seguimiento"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdate(false)}>Cancelar</Button>
          <Button onClick={handleSaveUpdate} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Create Report */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Reporte</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Título"
            value={newReport.titulo}
            onChange={(e) => setNewReport({ ...newReport, titulo: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Categoría</InputLabel>
            <Select
              value={newReport.categoria}
              label="Categoría"
              onChange={(e) => setNewReport({ ...newReport, categoria: e.target.value })}
            >
              <MenuItem value="Obras Publicas">Obras Públicas</MenuItem>
              <MenuItem value="Servicios Municipales">Servicios Municipales</MenuItem>
              <MenuItem value="OOAPAS">OOAPAS</MenuItem>
              <MenuItem value="Seguridad Publica">Seguridad Pública</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Descripción"
            multiline
            rows={4}
            value={newReport.descripcion}
            onChange={(e) => setNewReport({ ...newReport, descripcion: e.target.value })}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Evidencias (Fotos)</Typography>
            <input
              accept="image/*"
              type="file"
              multiple
              onChange={handleFileChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancelar</Button>
          <Button onClick={handleSaveCreate} variant="contained" color="primary">
            Crear Reporte
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;