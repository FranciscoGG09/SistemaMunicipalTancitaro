import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../services/report_service.dart';

class CreateReportScreen extends StatefulWidget {
  @override
  _CreateReportScreenState createState() => _CreateReportScreenState();
}

class _CreateReportScreenState extends State<CreateReportScreen> {
  final _tituloController = TextEditingController();
  final _descripcionController = TextEditingController();
  File? _image;
  final picker = ImagePicker();
  final _reportService = ReportService();
  bool _isLoading = false;

  String _categoriaSeleccionada = 'Obras Públicas';
  final List<String> _categorias = [
    'Obras Públicas',
    'Alumbrado',
    'Parques y Jardines',
    'Seguridad',
    'Agua Potable',
    'Limpia',
    'Otro'
  ];

  Future _tomarFoto() async {
    final pickedFile =
        await picker.pickImage(source: ImageSource.camera, imageQuality: 50);

    setState(() {
      if (pickedFile != null) {
        _image = File(pickedFile.path);
      } else {
        print('No image selected.');
      }
    });
  }

  Future<Position?> _obtenerUbicacion() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Por favor activa la ubicación')));
      return null;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Permiso de ubicación denegado')));
        return null;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Permiso de ubicación denegado permanentemente')));
      return null;
    }

    return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high);
  }

  void _enviarReporte() async {
    if (_tituloController.text.isEmpty || _image == null) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Título y Foto son obligatorios')));
      return;
    }

    setState(() => _isLoading = true);

    Position? position = await _obtenerUbicacion();
    if (position == null) {
      setState(() => _isLoading = false);
      return;
    }

    final result = await _reportService.enviarReporte(
      titulo: _tituloController.text,
      descripcion: _descripcionController.text,
      categoria: _categoriaSeleccionada,
      latitud: position.latitude,
      longitud: position.longitude,
      fotoPath: _image!.path,
    );

    setState(() => _isLoading = false);

    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(result['message'])));

    if (result['success']) {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Nuevo Reporte')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            GestureDetector(
              onTap: _tomarFoto,
              child: Container(
                height: 200,
                color: Colors.grey[300],
                child: _image != null
                    ? Image.file(_image!, fit: BoxFit.cover)
                    : Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.camera_alt,
                              size: 50, color: Colors.grey[600]),
                          Text('Presiona para tomar foto'),
                        ],
                      ),
              ),
            ),
            SizedBox(height: 20),
            TextField(
              controller: _tituloController,
              decoration: InputDecoration(labelText: 'Título del Problema'),
            ),
            TextField(
              controller: _descripcionController,
              decoration: InputDecoration(labelText: 'Descripción detallada'),
              maxLines: 3,
            ),
            SizedBox(height: 20),
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
              decoration: InputDecoration(labelText: 'Categoría'),
            ),
            SizedBox(height: 30),
            _isLoading
                ? Center(child: CircularProgressIndicator())
                : ElevatedButton.icon(
                    onPressed: _enviarReporte,
                    icon: Icon(Icons.send),
                    label: Text('Enviar Reporte'),
                    style: ElevatedButton.styleFrom(
                      padding: EdgeInsets.symmetric(vertical: 15),
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}
