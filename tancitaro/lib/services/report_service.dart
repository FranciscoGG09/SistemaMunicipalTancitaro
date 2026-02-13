import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'database_helper.dart';

class ReportService {
  String get baseUrl =>
      '${dotenv.env['API_URL'] ?? 'http://10.0.2.2:5000'}/api';

  // Enviar reporte (intenta online, si falla guarda offline)
  Future<Map<String, dynamic>> enviarReporte({
    required String titulo,
    required String descripcion,
    required String categoria,
    required double latitud,
    required double longitud,
    String? fotoPath,
  }) async {
    final connectivityResult = await (Connectivity().checkConnectivity());
    bool isConnected = connectivityResult.contains(ConnectivityResult.mobile) ||
        connectivityResult.contains(ConnectivityResult.wifi) ||
        connectivityResult.contains(ConnectivityResult.ethernet);

    if (isConnected) {
      return await _enviarAlBackend(
          titulo, descripcion, categoria, latitud, longitud, fotoPath);
    } else {
      await _guardarOffline(
          titulo, descripcion, categoria, latitud, longitud, fotoPath);
      return {
        'success': true,
        'message': 'Sin conexión. Reporte guardado localmente.'
      };
    }
  }

  Future<Map<String, dynamic>> _enviarAlBackend(
      String titulo,
      String descripcion,
      String categoria,
      double lat,
      double lng,
      String? fotoPath) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      var request =
          http.MultipartRequest('POST', Uri.parse('$baseUrl/reportes'));
      request.headers['Authorization'] = 'Bearer $token';

      request.fields['titulo'] = titulo;
      request.fields['descripcion'] = descripcion;
      request.fields['categoria'] = categoria;
      request.fields['latitud'] = lat.toString();
      request.fields['longitud'] = lng.toString();
      request.fields['dispositivo_origen'] = 'app_movil';

      if (fotoPath != null) {
        request.files.add(await http.MultipartFile.fromPath('fotos', fotoPath));
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 201) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        return {
          'success': false,
          'message': 'Error del servidor: ${response.statusCode}'
        };
      }
    } catch (e) {
      // Si falla por conexión, guardar offline
      await _guardarOffline(titulo, descripcion, categoria, lat, lng, fotoPath);
      return {
        'success': true,
        'message': 'Error de red. Guardado localmente para envío posterior.'
      };
    }
  }

  Future<void> _guardarOffline(String titulo, String descripcion,
      String categoria, double lat, double lng, String? fotoPath) async {
    final dbHelper = DatabaseHelper();
    await dbHelper.insertReporte({
      'titulo': titulo,
      'descripcion': descripcion,
      'categoria': categoria,
      'latitud': lat,
      'longitud': lng,
      'foto_path': fotoPath,
      'fecha': DateTime.now().toIso8601String(),
    });
  }

  Future<void> sincronizarReportes() async {
    final dbHelper = DatabaseHelper();
    final pendientes = await dbHelper.getReportesPendientes();

    if (pendientes.isEmpty) return;

    final connectivityResult = await (Connectivity().checkConnectivity());
    if (connectivityResult.contains(ConnectivityResult.none)) return;

    for (var reporte in pendientes) {
      final result = await _enviarAlBackend(
        reporte['titulo'],
        reporte['descripcion'],
        reporte['categoria'],
        reporte['latitud'],
        reporte['longitud'],
        reporte['foto_path'],
      );

      if (result['success'] == true &&
          !result['message'].toString().contains('Guardado localmente')) {
        await dbHelper.deleteReporte(reporte['id']);
      }
    }
  }

  Future<List<dynamic>> getMisReportes() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('$baseUrl/reportes'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['reportes'] ?? [];
      } else {
        return [];
      }
    } catch (e) {
      return [];
    }
  }

  Future<List<Map<String, dynamic>>> getReportesPendientes() async {
    final dbHelper = DatabaseHelper();
    return await dbHelper.getReportesPendientes();
  }
}
