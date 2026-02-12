import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'auth_service.dart';

class NewsService {
  String get baseUrl =>
      '${dotenv.env['API_URL'] ?? 'http://10.0.2.2:5000'}/api';

  Future<List<dynamic>> getNoticias() async {
    try {
      // News are public, or user-based? Usually public or auth required.
      // Assuming headers needed if protected.
      final authService = AuthService();
      final token = await authService.getToken();

      final response = await http.get(
        Uri.parse('$baseUrl/noticias'),
        headers: token != null ? {'Authorization': 'Bearer $token'} : {},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['noticias'] ?? [];
      } else {
        throw Exception('Failed to load news');
      }
    } catch (e) {
      print('Error fetching news: $e');
      return [];
    }
  }
}
