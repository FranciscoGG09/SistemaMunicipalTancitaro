import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    FormControl, InputLabel, Select, MenuItem, Alert, IconButton
} from '@mui/material';
import { Add, Delete, PersonAdd, Edit } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

import { authAPI } from '../services/api';

const AdminUsers = () => {
    const { token, user } = useAuth(); // Assuming AuthContext provides token and current user
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const [newUser, setNewUser] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'trabajador',
        departamento: ''
    });

    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await authAPI.getAllUsers();
            // Ocultar el usuario admin del sistema
            const filtered = (response.data.usuarios || []).filter(
                u => u.email !== 'admin@tancitaro.gob.mx'
            );
            setUsers(filtered);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Error al cargar usuarios. Asegúrese de ser administrador.');
        }
    };

    const handleCreate = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await authAPI.register(newUser);
            setSuccess('Usuario creado exitosamente');
            setOpen(false);
            setNewUser({ nombre: '', email: '', password: '', rol: 'trabajador', departamento: '' });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (userToEdit) => {
        setEditingUser({ ...userToEdit }); // Copy user data
        setOpenEdit(true);
    };

    const handleUpdate = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await authAPI.updateUser(editingUser.id, editingUser);
            setSuccess('Usuario actualizado exitosamente');
            setOpenEdit(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setConfirmDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        setLoading(true);
        try {
            await authAPI.deleteUser(userToDelete.id);
            setSuccess('Usuario eliminado exitosamente');
            setConfirmDeleteOpen(false);
            setUserToDelete(null);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.error || err.message);
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

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ backgroundColor: 'var(--light-blue)' }}>
                        <TableRow>
                            <TableCell><strong>Nombre</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Rol</strong></TableCell>
                            <TableCell><strong>Departamento</strong></TableCell>
                            <TableCell align="center"><strong>Acciones</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((u) => (
                            <TableRow key={u.id}>
                                <TableCell>{u.nombre}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>{u.rol}</TableCell>
                                <TableCell>{u.departamento || '-'}</TableCell>
                                <TableCell align="center">
                                    <IconButton color="primary" onClick={() => handleEditClick(u)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDeleteClick(u)} disabled={u.id === user?.id}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No hay usuarios encontrados</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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
                                    <MenuItem value="Servicios Municipales">Servicios Municipales</MenuItem>
                                    <MenuItem value="OOAPAS">OOAPAS</MenuItem>
                                    <MenuItem value="Seguridad Publica">Seguridad Pública</MenuItem>
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

            {/* Modal Editar Usuario */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
                <DialogTitle>Editar Usuario</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1, minWidth: 400 }}>
                        {editingUser && (
                            <>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Nombre Completo"
                                    value={editingUser.nombre}
                                    onChange={(e) => setEditingUser({ ...editingUser, nombre: e.target.value })}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Email"
                                    type="email"
                                    value={editingUser.email}
                                    disabled
                                />
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Rol</InputLabel>
                                    <Select
                                        value={editingUser.rol}
                                        label="Rol"
                                        disabled
                                    >
                                        <MenuItem value="admin">Administrador</MenuItem>
                                        <MenuItem value="comunicacion_social">Comunicación Social</MenuItem>
                                        <MenuItem value="trabajador">Trabajador</MenuItem>
                                        <MenuItem value="ciudadano">Ciudadano</MenuItem>
                                    </Select>
                                </FormControl>
                                {editingUser.rol === 'trabajador' && (
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Departamento</InputLabel>
                                        <Select
                                            value={editingUser.departamento || ''}
                                            label="Departamento"
                                            disabled
                                        >
                                            <MenuItem value="Obras Publicas">Obras Públicas</MenuItem>
                                            <MenuItem value="Servicios Municipales">Servicios Municipales</MenuItem>
                                            <MenuItem value="OOAPAS">OOAPAS</MenuItem>
                                            <MenuItem value="Seguridad Publica">Seguridad Pública</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Nueva Contraseña (dejar vacío para no cambiar)"
                                    type="password"
                                    value={editingUser.password || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                />
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
                    <Button onClick={handleUpdate} variant="contained" disabled={loading}>Guardar Cambios</Button>
                </DialogActions>
            </Dialog>

            {/* Dialogo Confirmar Eliminar */}
            <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Está seguro que desea eliminar al usuario <strong>{userToDelete?.nombre}</strong>?
                        Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteOpen(false)}>Cancelar</Button>
                    <Button onClick={handleDelete} variant="contained" color="error" disabled={loading}>Eliminar</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default AdminUsers;
