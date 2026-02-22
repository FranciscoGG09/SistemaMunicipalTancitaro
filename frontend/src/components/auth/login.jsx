import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { AccountCircle, Lock } from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs" className="auth-container">
      <Paper
        elevation={8}
        className="auth-paper"
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img src="/logo512.png" alt="Logo Municipio" style={{ width: '150px', marginBottom: '1rem' }} />
          <Typography
            component="h1"
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: 'var(--primary-blue)'
            }}
          >
            Sistema Municipal Tancítaro
          </Typography>
          <Typography
            component="h2"
            variant="subtitle1"
            color="textSecondary"
          >
            Iniciar Sesión
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: <AccountCircle sx={{ color: 'action.active', mr: 1 }} />
            }}
            placeholder="correo@ejemplo.com"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} />
            }}
            placeholder="••••••••"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              backgroundColor: 'var(--primary-blue)',
              '&:hover': {
                backgroundColor: 'var(--secondary-blue)'
              }
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
          </Button>
        </Box>


      </Paper>
    </Container>
  );
};

export default Login;