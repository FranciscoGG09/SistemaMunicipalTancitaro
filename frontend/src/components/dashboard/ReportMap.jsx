import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Box, Typography, Paper } from '@mui/material';
import api from '../../services/api';

// Fix leafet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const ReportMap = () => {
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportes = async () => {
            try {
                const response = await api.get('/reportes');
                // Filter reports that have location data
                const reportesConUbicacion = response.data.reportes.filter(
                    r => r.latitud && r.longitud
                );
                setReportes(reportesConUbicacion);
            } catch (error) {
                console.error('Error cargando reportes para el mapa', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReportes();
    }, []);

    if (loading) return <Typography>Cargando mapa...</Typography>;

    // Default center (Tancítaro coordinates)
    const center = [19.3361, -102.3644];

    return (
        <Paper elevation={3} sx={{ p: 2, height: '500px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Mapa de Reportes</Typography>
            <Box sx={{ flexGrow: 1 }}>
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {reportes.map((reporte) => (
                        <Marker key={reporte.id} position={[reporte.latitud, reporte.longitud]}>
                            <Popup>
                                <Typography variant="subtitle2">{reporte.titulo}</Typography>
                                <Typography variant="body2">{reporte.categoria}</Typography>
                                <Typography variant="caption">{new Date(reporte.creado_en).toLocaleDateString()}</Typography>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </Box>
        </Paper>
    );
};

export default ReportMap;
