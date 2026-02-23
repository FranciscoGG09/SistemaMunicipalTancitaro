import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../models/report.dart';
import '../models/news.dart';
import '../models/user.dart';

class ApiService {
  String get baseUrl =>
      dotenv.env['API_URL'] ?? 'http://192.168.101.11:3000/api';
  final SharedPreferences prefs;

  ApiService(this.prefs);

  Future<String?> _getToken() async {
    return prefs.getString('auth_token');
  }

  // Autenticación
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await prefs.setString('auth_token', data['token']);
        // The backend returns 'usuario', not 'user'
        final usuario = data['usuario'] ?? data['user'];
        if (usuario != null && usuario['id'] != null) {
          await prefs.setString('user_id', usuario['id']);
        }
        return {'success': true};
      }

      final body = json.decode(response.body);
      return {
        'success': false,
        'message': body['message'] ??
            body['error'] ??
            'Error ${response.statusCode}: ${response.body}'
      };
    } catch (e) {
      return {'success': false, 'message': 'Error de conexión: $e'};
    }
  }

  Future<Map<String, dynamic>> register(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/registrar-publico'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'password': password,
          'nombre': email.split('@')[0], // Añadir campo nombre por defecto
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {'success': true};
      }

      final body = json.decode(response.body);
      return {
        'success': false,
        'message': body['message'] ??
            body['error'] ??
            'Error ${response.statusCode}: ${response.body}'
      };
    } catch (e) {
      return {'success': false, 'message': 'Error de conexión: $e'};
    }
  }

  // Noticias
  Future<List<News>> getNews() async {
    final token = await _getToken();

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/noticias'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((item) => News.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      print('Get news error: $e');
      return [];
    }
  }

  // Reportes
  Future<bool> submitReport(Report report, File image) async {
    final token = await _getToken();

    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/reportes'),
      )..headers['Authorization'] = 'Bearer $token';

      // Agregar campos del reporte
      request.fields['titulo'] = report.title;
      request.fields['descripcion'] = report.description;
      request.fields['categoria'] = report.category;
      request.fields['latitud'] = report.latitude.toString();
      request.fields['longitud'] = report.longitude.toString();

      // Backend espera status?
      if (report.status.isNotEmpty) {
        request.fields['status'] = report.status;
      }

      // Agregar imagen
      request.files.add(
        await http.MultipartFile.fromPath(
          'fotos',
          image.path,
          filename: '${report.id}.jpg',
        ),
      );

      final response = await request.send();
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (e) {
      print('Submit report error: $e');
      return false;
    }
  }

  // Perfil de usuario
  Future<User?> getUserProfile() async {
    final token = await _getToken();

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/auth/perfil'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return User.fromJson(data['usuario'] ?? data);
      }
      return null;
    } catch (e) {
      print('Get profile error: $e');
      return null;
    }
  }

  Future<bool> updateProfile({
    required String firstName,
    required String lastName,
    required String email,
  }) async {
    final token = await _getToken();
    final userId = prefs.getString('user_id');
    if (userId == null) return false;

    try {
      final response = await http.put(
        Uri.parse('$baseUrl/auth/usuarios/$userId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'nombre': '$firstName $lastName',
          'email': email,
        }),
      );

      if (response.statusCode == 200) {
        // Actualizar estado de perfil completo
        await prefs.setBool('profile_complete', true);
        return true;
      }
      return false;
    } catch (e) {
      print('Update profile error: $e');
      return false;
    }
  }

  // Obtener reportes del usuario
  Future<List<Report>> getUserReports() async {
    final token = await _getToken();

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/reportes'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final dynamic data = json.decode(response.body);
        final List<dynamic> reportes = data['reportes'] ?? data;
        return reportes.map((item) => Report.fromMap(item)).toList();
      }
      return [];
    } catch (e) {
      print('Get user reports error: $e');
      return [];
    }
  }

  // Sincronización offline
  Future<bool> syncOfflineReports(List<Report> reports) async {
    try {
      for (var report in reports) {
        final image = File(report.imagePath);
        if (image.existsSync()) {
          final success = await submitReport(report, image);
          if (!success) return false;
        }
      }
      return true;
    } catch (e) {
      print('Sync offline reports error: $e');
      return false;
    }
  }
}
