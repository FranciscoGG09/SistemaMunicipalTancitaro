class User {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String rol;

  User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    required this.rol,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    // Backend returns 'nombre' which might be full name or just first name.
    // We need to parse it or just map it.
    // Assuming backend 'nombre' maps to firstName for now, or split it.
    // Backend: id, nombre, email, rol, departamento

    String fullName = json['nombre'] ?? '';
    List<String> nameParts = fullName.split(' ');
    String first = nameParts.isNotEmpty ? nameParts.first : '';
    String last = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';

    return User(
      id: json['id'].toString(),
      firstName: first,
      lastName: last,
      email: json['email'] ?? '',
      phone: json['telefono'] ??
          '', // Backend might not have phone yet, handling it gracefully
      rol: json['rol'] ?? 'ciudadano',
    );
  }

  String get fullName => '$firstName $lastName'.trim();

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': fullName,
      'email': email,
      'telefono': phone,
      'rol': rol,
    };
  }
}
