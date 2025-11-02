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
    <Container 
      component="main" 
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <Paper 
        elevation={8}
        sx={{
          padding: 4,
          width: '100%',
          borderRadius: 2,
          background: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            component="h1" 
            variant="h4" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: '#2c5aa0'
            }}
          >
            🏛️ Sistema Municipal Tancítaro
          </Typography>
          <Typography 
            component="h2" 
            variant="h6" 
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
            placeholder="admin@tancitaro.gob.mx"
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
            placeholder="admin123"
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
          </Button>
        </Box>

        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" color="textSecondary">
            <strong>Credenciales de prueba:</strong>
          </Typography>
          <Typography variant="caption" display="block">
            👑 Admin: admin@tancitaro.gob.mx / admin123
          </Typography>
          <Typography variant="caption" display="block">
            👷 Trabajador: obras@tancitaro.gob.mx / password123
          </Typography>
          <Typography variant="caption" display="block">
            👤 Ciudadano: ciudadano@ejemplo.com / password123
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;