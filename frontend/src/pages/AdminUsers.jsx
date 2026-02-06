import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    FormControl, InputLabel, Select, MenuItem, Alert, IconButton
} from '@mui/material';
import { Add, Delete, PersonAdd } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// Mock function to simulate API calls (replace with real API calls)
// In a real app, you would import an API service here
const api = {
    getUsers: async (token) => {
        // This should call backend /api/users
        // For now, returning mock data or empty array if backend not ready
        return [];
    },
    createUser: async (userData, token) => {
        // Call backend POST /api/auth/registrar
        const response = await fetch('http://localhost:5000/api/auth/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al crear usuario');
        return data;
    }
};

const AdminUsers = () => {
    const { token } = useAuth(); // Assuming AuthContext provides token
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [newUser, setNewUser] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'trabajador',
        departamento: ''
    });

    const fetchUsers = async () => {
        // Implement fetching users from backend if endpoint exists
        // For now, we might not have a "get all users" endpoint in the plan?
        // The plan said "Admin Routes (Manage Users)". I need to add that endpoint to backend if not exists.
        // I will assume for now we only create users. Listing might require a new endpoint.
    };

    const handleCreate = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await api.createUser(newUser, token); // Using the token effectively
            setSuccess('Usuario creado exitosamente');
            setOpen(false);
            setNewUser({ nombre: '', email: '', password: '', rol: 'trabajador', departamento: '' });
            // fetchUsers();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ color: 'var(--primary-blue)', fontWeight: 'bold' }}>
                    Gestión de Usuarios
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => setOpen(true)}
                    sx={{ backgroundColor: 'var(--primary-blue)' }}
                >
                    Nuevo Usuario
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 3 }}>
                    Función de listado de usuarios pendiente de implementar en backend.
                    <br />
                    Utilice el botón "Nuevo Usuario" para registrar personal.
                </Typography>
                {/* Table would go here */}
            </Paper>

            {/* Modal Crear Usuario */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1, minWidth: 400 }}>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Nombre Completo"
                            value={newUser.nombre}
                            onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Contraseña"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Rol</InputLabel>
                            <Select
                                value={newUser.rol}
                                label="Rol"
                                onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}
                            >
                                <MenuItem value="admin">Administrador</MenuItem>
                                <MenuItem value="comunicacion_social">Comunicación Social</MenuItem>
                                <MenuItem value="trabajador">Trabajador</MenuItem>
                                <MenuItem value="ciudadano">Ciudadano</MenuItem>
                            </Select>
                        </FormControl>
                        {newUser.rol === 'trabajador' && (
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Departamento</InputLabel>
                                <Select
                                    value={newUser.departamento}
                                    label="Departamento"
                                    onChange={(e) => setNewUser({ ...newUser, departamento: e.target.value })}
                                >
                                    <MenuItem value="Obras Publicas">Obras Públicas</MenuItem>
                                    <MenuItem value="Alumbrado">Alumbrado</MenuItem>
                                    <MenuItem value="Parques y Jardines">Parques y Jardines</MenuItem>
                                    <MenuItem value="Agua Potable">Agua Potable</MenuItem>
                                    <MenuItem value="Limpia">Limpia</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreate} variant="contained" disabled={loading}>Crear</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminUsers;
