import 'package:flutter/material.dart';
import 'package:provider/provider.dart'; // Add this
import '../services/auth_service.dart';
import 'register_screen.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  // final _authService = AuthService(); // Remove local instance
  bool _isLoading = false;

  void _login() async {
    setState(() => _isLoading = true);
    final authService = Provider.of<AuthService>(context, listen: false);
    final result = await authService.login(
      _emailController.text,
      _passwordController.text,
    );
    setState(() => _isLoading = false);

    if (result['success']) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => HomeScreen()),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message'])),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Iniciar Sesión')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _emailController,
              decoration:
                  const InputDecoration(labelText: 'Correo Electrónico'),
              keyboardType: TextInputType.emailAddress,
            ),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'Contraseña'),
              obscureText: true,
            ),
            const SizedBox(height: 20),
            _isLoading
                ? const CircularProgressIndicator()
                : ElevatedButton(
                    onPressed: _login,
                    child: const Text('Ingresar'),
                  ),
            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => RegisterScreen()),
                );
              },
              child: const Text('¿No tienes cuenta? Regístrate'),
            ),
          ],
        ),
      ),
    );
  }
}
