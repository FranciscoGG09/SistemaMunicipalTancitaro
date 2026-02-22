import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../services/report_service.dart';

class CreateReportScreen extends StatefulWidget {
  const CreateReportScreen({super.key});

  @override
  _CreateReportScreenState createState() => _CreateReportScreenState();
}

class _CreateReportScreenState extends State<CreateReportScreen> {
  final _tituloController = TextEditingController();
  final _descripcionController = TextEditingController();
  File? _image;
  Position? _position;
  final picker = ImagePicker();
  final _reportService = ReportService();
  bool _isLoading = false;

  // Pasos del flujo: 0=inicio, 1=formulario, 2=previsualización
  int _currentStep = 0;

  String _categoriaSeleccionada = 'Obras Públicas';
  final List<String> _categorias = [
    'Obras Públicas',
    'Servicios Municipales',
    'OOAPAS',
    'Seguridad Pública',
  ];

  @override
  void initState() {
    super.initState();
    // Iniciar el flujo abriendo la cámara automáticamente
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _iniciarFlujo();
    });
  }

  Future<void> _iniciarFlujo() async {
    // Paso 1: Tomar foto
    final pickedFile =
        await picker.pickImage(source: ImageSource.camera, imageQuality: 50);

    if (pickedFile == null) {
      // Si no toma foto, regresar a la pantalla anterior
      if (mounted) Navigator.pop(context);
      return;
    }

    setState(() {
      _image = File(pickedFile.path);
      _isLoading = true;
    });

    // Paso 2: Obtener ubicación automáticamente
    final position = await _obtenerUbicacion();
    if (position == null) {
      setState(() => _isLoading = false);
      if (mounted) Navigator.pop(context);
      return;
    }

    setState(() {
      _position = position;
      _isLoading = false;
      _currentStep = 1; // Ir al formulario
    });
  }

  Future<Position?> _obtenerUbicacion() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Por favor activa la ubicación')));
      }
      return null;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Permiso de ubicación denegado')));
        }
        return null;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Permiso de ubicación denegado permanentemente')));
      }
      return null;
    }

    return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high);
  }

  void _irAPrevisualizar() {
    if (_tituloController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('El título es obligatorio')));
      return;
    }
    setState(() {
      _currentStep = 2; // Ir a previsualizar
    });
  }

  void _regresarAFormulario() {
    setState(() {
      _currentStep = 1; // Volver al formulario
    });
  }

  void _enviarReporte() async {
    setState(() => _isLoading = true);

    final result = await _reportService.enviarReporte(
      titulo: _tituloController.text,
      descripcion: _descripcionController.text,
      categoria: _categoriaSeleccionada,
      latitud: _position!.latitude,
      longitud: _position!.longitude,
      fotoPath: _image!.path,
    );

    setState(() => _isLoading = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'] ?? 'Reporte enviado')));

      if (result['success'] == true) {
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_getAppBarTitle()),
      ),
      body: _isLoading
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Obteniendo ubicación...'),
                ],
              ),
            )
          : _buildCurrentStep(),
    );
  }

  String _getAppBarTitle() {
    switch (_currentStep) {
      case 0:
        return 'Nuevo Reporte';
      case 1:
        return 'Información del Reporte';
      case 2:
        return 'Previsualización';
      default:
        return 'Nuevo Reporte';
    }
  }

  Widget _buildCurrentStep() {
    switch (_currentStep) {
      case 1:
        return _buildFormulario();
      case 2:
        return _buildPreview();
      default:
        return const Center(child: CircularProgressIndicator());
    }
  }

  /// Paso 1: Formulario para llenar información
  Widget _buildFormulario() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Mostrar foto tomada
          if (_image != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.file(
                _image!,
                height: 180,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
          const SizedBox(height: 8),
          if (_position != null)
            Text(
              '📍 Ubicación capturada: ${_position!.latitude.toStringAsFixed(5)}, ${_position!.longitude.toStringAsFixed(5)}',
              style: TextStyle(color: Colors.grey[600], fontSize: 12),
              textAlign: TextAlign.center,
            ),
          const SizedBox(height: 20),
          TextField(
            controller: _tituloController,
            decoration: const InputDecoration(labelText: 'Título del Problema'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _descripcionController,
            decoration:
                const InputDecoration(labelText: 'Descripción detallada'),
            maxLines: 3,
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _categoriaSeleccionada,
            items: _categorias.map((String category) {
              return DropdownMenuItem<String>(
                value: category,
                child: Text(category),
              );
            }).toList(),
            onChanged: (newValue) {
              setState(() {
                _categoriaSeleccionada = newValue!;
              });
            },
            decoration:
                const InputDecoration(labelText: 'Dirección / Categoría'),
          ),
          const SizedBox(height: 30),
          ElevatedButton.icon(
            onPressed: _irAPrevisualizar,
            icon: const Icon(Icons.preview),
            label: const Text('Aceptar y Previsualizar'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 15),
            ),
          ),
        ],
      ),
    );
  }

  /// Paso 2: Previsualización de toda la información antes de enviar
  Widget _buildPreview() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Revisa la información antes de enviar:',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),

          // Foto
          if (_image != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.file(
                _image!,
                height: 200,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
          const SizedBox(height: 16),

          // Info
          Card(
            elevation: 2,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildInfoRow('Título', _tituloController.text),
                  const Divider(),
                  _buildInfoRow(
                      'Descripción',
                      _descripcionController.text.isEmpty
                          ? 'Sin descripción'
                          : _descripcionController.text),
                  const Divider(),
                  _buildInfoRow('Categoría', _categoriaSeleccionada),
                  const Divider(),
                  _buildInfoRow('Ubicación',
                      '${_position?.latitude.toStringAsFixed(5)}, ${_position?.longitude.toStringAsFixed(5)}'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Botones
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _regresarAFormulario,
                  icon: const Icon(Icons.edit),
                  label: const Text('Editar'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 15),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _isLoading ? null : _enviarReporte,
                  icon: const Icon(Icons.send),
                  label: const Text('Enviar Reporte'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: const TextStyle(
                  fontWeight: FontWeight.bold, color: Colors.grey),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }
}
