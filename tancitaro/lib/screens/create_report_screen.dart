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
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(_getAppBarTitle(),
            style: const TextStyle(
                fontWeight: FontWeight.bold, color: Colors.black87)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      body: _isLoading
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Procesando...', style: TextStyle(color: Colors.grey)),
                ],
              ),
            )
          : SafeArea(child: _buildCurrentStep()),
    );
  }

  String _getAppBarTitle() {
    switch (_currentStep) {
      case 0:
        return 'Nuevo Reporte';
      case 1:
        return 'Detalles del Problema';
      case 2:
        return 'Resumen';
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
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Mostrar foto tomada
          if (_image != null)
            Container(
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 8,
                        offset: const Offset(0, 4))
                  ]),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.file(
                  _image!,
                  height: 200,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),
            ),
          const SizedBox(height: 12),
          if (_position != null)
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.location_on,
                    size: 16, color: Colors.redAccent),
                const SizedBox(width: 4),
                Text(
                  '${_position!.latitude.toStringAsFixed(5)}, ${_position!.longitude.toStringAsFixed(5)}',
                  style: TextStyle(color: Colors.grey[600], fontSize: 13),
                ),
              ],
            ),
          const SizedBox(height: 24),
          TextField(
            controller: _tituloController,
            decoration: InputDecoration(
              labelText: 'Título del Problema',
              hintText: 'Ej. Bache profundo en calle',
              prefixIcon: const Icon(Icons.title),
              border:
                  OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _descripcionController,
            decoration: InputDecoration(
              labelText: 'Descripción detallada',
              hintText: 'Explica el problema con más detalle...',
              alignLabelWithHint: true,
              border:
                  OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
            maxLines: 4,
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
            decoration: InputDecoration(
              labelText: 'Categoría',
              prefixIcon: const Icon(Icons.category),
              border:
                  OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 32),
          SizedBox(
            height: 54,
            child: ElevatedButton.icon(
              onPressed: _irAPrevisualizar,
              icon: const Icon(Icons.arrow_forward),
              label: const Text('Continuar', style: TextStyle(fontSize: 16)),
              style: ElevatedButton.styleFrom(
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Paso 2: Previsualización de toda la información antes de enviar
  Widget _buildPreview() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Revisa tu reporte antes de enviarlo',
            style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.blueGrey.shade800),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),

          // Foto
          if (_image != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.file(
                _image!,
                height: 220,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
          const SizedBox(height: 24),

          // Info
          Card(
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            elevation: 3,
            shadowColor: Colors.black26,
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildInfoRow(Icons.title, 'Título', _tituloController.text),
                  const Divider(height: 24),
                  _buildInfoRow(
                      Icons.description,
                      'Descripción',
                      _descripcionController.text.isEmpty
                          ? 'Sin descripción'
                          : _descripcionController.text),
                  const Divider(height: 24),
                  _buildInfoRow(
                      Icons.category, 'Categoría', _categoriaSeleccionada),
                  const Divider(height: 24),
                  _buildInfoRow(Icons.location_on, 'Ubicación',
                      '${_position?.latitude.toStringAsFixed(5)}, ${_position?.longitude.toStringAsFixed(5)}'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),

          // Botones
          Row(
            children: [
              Expanded(
                flex: 1,
                child: SizedBox(
                  height: 54,
                  child: OutlinedButton.icon(
                    onPressed: _regresarAFormulario,
                    icon: const Icon(Icons.edit, size: 20),
                    label: const Text('Editar'),
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                flex: 2,
                child: SizedBox(
                  height: 54,
                  child: ElevatedButton.icon(
                    onPressed: _isLoading ? null : _enviarReporte,
                    icon: const Icon(Icons.send, size: 20),
                    label: const Text('Enviar Reporte',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue.shade700,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: Colors.blueGrey),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.grey,
                    fontSize: 12),
              ),
              const SizedBox(height: 4),
              Text(value,
                  style: const TextStyle(fontSize: 15, color: Colors.black87)),
            ],
          ),
        ),
      ],
    );
  }
}
