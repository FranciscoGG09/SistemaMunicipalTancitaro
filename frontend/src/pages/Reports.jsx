import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, TextField, Button, Grid
} from '@mui/material';
import { Edit, Visibility, Add } from '@mui/icons-material';
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
    setNewStatus(report.status);
    setOpenUpdate(true);
  };

  const handleSaveUpdate = async () => {
    try {
      await reportsAPI.update(selectedReport.id, {
        estado: newStatus,
        notas: notes
      });
      setOpenUpdate(false);
      fetchReports(); // Refresh list
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const handleViewClick = (report) => {
    setSelectedReport(report);
    setOpenView(true);
  };

  const calculateDuration = (history) => {
    if (!history || history.length < 2) return 'N/A';
    // Logic to calculate duration would go here
    return history.map((h, i) => (
      <li key={i}>
        <strong>{h.estado}</strong>: {new Date(h.fecha).toLocaleString()}
        {h.notas && <span> - {h.notas}</span>}
      </li>
    ));
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
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateClick}
          sx={{ backgroundColor: 'var(--primary-blue)' }}
        >
          Nuevo Reporte
        </Button>
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
                <TableCell>{report.title}</TableCell>
                <TableCell>{report.category}</TableCell>
                <TableCell>{report.created_at}</TableCell>
                <TableCell>
                  <Chip label={report.status.replace('_', ' ')} color={getStatusColor(report.status)} size="small" />
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog View Details */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles del Reporte</DialogTitle>
        <DialogContent dividers>
          {selectedReport && (
            <Box>
              <Typography variant="h6">{selectedReport.title}</Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Categoría: {selectedReport.category}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedReport.description || 'Sin descripción'}
              </Typography>

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                Historial de Estatus
              </Typography>
              <ul>
                {/* Mock history implementation */}
                <li><strong>creado:</strong> {selectedReport.created_at}</li>
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
              <MenuItem value="Alumbrado">Alumbrado</MenuItem>
              <MenuItem value="Obras Publicas">Obras Públicas</MenuItem>
              <MenuItem value="Parques y Jardines">Parques y Jardines</MenuItem>
              <MenuItem value="Agua Potable">Agua Potable</MenuItem>
              <MenuItem value="Seguridad">Seguridad</MenuItem>
              <MenuItem value="Otros">Otros</MenuItem>
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