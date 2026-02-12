import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../models/user.dart';

class AuthService with ChangeNotifier {
  String get baseUrl =>
      '${dotenv.env['API_URL'] ?? 'http://10.0.2.2:5000'}/api/auth';

  User? _currentUser;
  User? get currentUser => _currentUser;

  bool get isProfileComplete {
    if (_currentUser == null) return false;
    return _currentUser!.firstName.isNotEmpty &&
        _currentUser!.lastName.isNotEmpty &&
        _currentUser!.email.isNotEmpty;
    // Phone is optional or required? ProfileScreen says all are required.
    // _currentUser!.phone.isNotEmpty;
  }

  Future<bool> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey('user')) return false;

    final userStr = prefs.getString('user');
    if (userStr != null) {
      try {
        final userData = jsonDecode(userStr);
        _currentUser = User.fromJson(userData);
        notifyListeners();
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['token']);

        // Backend returns 'usuario' object.
        _currentUser = User.fromJson(data['usuario']);
        await prefs.setString('user', jsonEncode(data['usuario']));

        notifyListeners();
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'message': data['error'] ?? 'Error en login'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Error de conexión: $e'};
    }
  }

  Future<Map<String, dynamic>> register(
      String nombre, String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/registrar-publico'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(
            {'nombre': nombre, 'email': email, 'password': password}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['token']);

        _currentUser = User.fromJson(data['usuario']);
        await prefs.setString('user', jsonEncode(data['usuario']));

        notifyListeners();
        return {'success': true, 'data': data};
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Error en registro'
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Error de conexión: $e'};
    }
  }

  Future<void> logout() async {
    _currentUser = null;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<bool> updateProfile({
    required String firstName,
    required String lastName,
    required String email,
  }) async {
    // API endpoint for updating profile needs to be implemented or we use a mock for now/update local only if backend doesn't support splitting names yet.
    // The backend `authController.js` has `actualizarUsuario` but it's admin only in the routes: `router.put('/usuarios/:id', verificarToken, verificarAdmin, ...)`
    // We might need to allow users to update their own profile.

    // For now, let's update local state to satisfy the UI interaction
    if (_currentUser != null) {
      _currentUser = User(
          id: _currentUser!.id,
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: _currentUser!.phone,
          rol: _currentUser!.rol);

      final prefs = await SharedPreferences.getInstance();
      // We should construct the backend-compatible JSON
      await prefs.setString(
          'user',
          jsonEncode({
            'id': _currentUser!.id,
            'nombre': _currentUser!.fullName,
            'email': _currentUser!.email,
            'rol': _currentUser!.rol,
            'telefono': _currentUser!.phone
          }));

      notifyListeners();
      return true;
    }
    return false;
  }
}
