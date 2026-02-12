import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'create_report_screen.dart';
import '../services/auth_service.dart';
import '../services/news_service.dart';
import 'login_screen.dart';
import 'package:intl/intl.dart';
import '../services/report_service.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'profile_screen.dart';

// News Screen
class NewsScreen extends StatefulWidget {
  @override
  _NewsScreenState createState() => _NewsScreenState();
}

class _NewsScreenState extends State<NewsScreen> {
  final NewsService _newsService = NewsService();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<dynamic>>(
      future: _newsService.getNoticias(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text('Error al cargar noticias'));
        }
        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return Center(child: Text('No hay noticias disponibles'));
        }

        return ListView.builder(
          itemCount: snapshot.data!.length,
          itemBuilder: (context, index) {
            final noticia = snapshot.data![index];
            return Card(
              margin: EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (noticia['adjuntos'] != null &&
                      (noticia['adjuntos'] as List).isNotEmpty)
                    Image.network(
                      noticia['adjuntos'][0],
                      height: 200,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                          height: 200,
                          color: Colors.grey,
                          child: Icon(Icons.broken_image)),
                    ),
                  Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          noticia['titulo'] ?? 'Sin Título',
                          style: TextStyle(
                              fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        SizedBox(height: 8),
                        Text(
                          noticia['contenido'] ?? '',
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                        SizedBox(height: 8),
                        Text(
                          new DateFormat('dd/MM/yyyy').format(DateTime.parse(
                              noticia['publicado_en'] ??
                                  DateTime.now().toIso8601String())),
                          style: TextStyle(color: Colors.grey, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

// My Reports Screen
class MyReportsScreen extends StatefulWidget {
  @override
  _MyReportsScreenState createState() => _MyReportsScreenState();
}

class _MyReportsScreenState extends State<MyReportsScreen> {
  final ReportService _reportService = ReportService();
  List<dynamic> _onlineReports = [];
  List<Map<String, dynamic>> _offlineReports = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadReports();
  }

  Future<void> _loadReports() async {
    final online = await _reportService.getMisReportes();
    final offline = await _reportService.getReportesPendientes();
    if (mounted) {
      setState(() {
        _onlineReports = online;
        _offlineReports = offline;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return Center(child: CircularProgressIndicator());

    if (_onlineReports.isEmpty && _offlineReports.isEmpty) {
      return Center(child: Text('No tienes reportes creados'));
    }

    return ListView(
      children: [
        if (_offlineReports.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text('Pendientes de sincronizar',
                style: TextStyle(
                    fontWeight: FontWeight.bold, color: Colors.orange)),
          ),
          ..._offlineReports
              .map((reporte) => ListTile(
                    leading: Icon(Icons.sync_problem, color: Colors.orange),
                    title: Text(reporte['titulo']),
                    subtitle: Text(reporte['fecha'] ?? ''),
                    trailing: Text('Offline'),
                  ))
              .toList(),
          Divider(),
        ],
        if (_onlineReports.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text('Enviados',
                style:
                    TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
          ),
          ..._onlineReports
              .map((reporte) => ListTile(
                    leading: Icon(Icons.check_circle, color: Colors.green),
                    title: Text(reporte['titulo']),
                    subtitle: Text(reporte['estado']),
                    trailing: Icon(Icons.chevron_right),
                    onTap: () {
                      // Ver detalles
                    },
                  ))
              .toList(),
        ]
      ],
    );
  }
}

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  final ReportService _reportService = ReportService();

  @override
  void initState() {
    super.initState();
    _setupConnectivityListener();
    _reportService.sincronizarReportes(); // Try to sync on startup
  }

  void _setupConnectivityListener() {
    Connectivity()
        .onConnectivityChanged
        .listen((List<ConnectivityResult> results) {
      if (results.contains(ConnectivityResult.mobile) ||
          results.contains(ConnectivityResult.wifi)) {
        print("Conexión detectada. Sincronizando reportes...");
        _reportService.sincronizarReportes().then((_) {
          if (mounted) setState(() {});
        });
      }
    });
  }

  static List<Widget> _widgetOptions = <Widget>[
    NewsScreen(),
    MyReportsScreen(),
    ProfileScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  void _logout() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    await authService.logout();
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Tancítaro Digital'),
        actions: [
          IconButton(icon: Icon(Icons.logout), onPressed: _logout),
        ],
      ),
      body: _widgetOptions.elementAt(_selectedIndex),
      floatingActionButton: _selectedIndex == 1
          ? FloatingActionButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => CreateReportScreen()),
                );
              },
              child: Icon(Icons.add_a_photo),
              tooltip: 'Crear Reporte',
            )
          : null,
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.article),
            label: 'Noticias',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.report_problem),
            label: 'Reportes',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Perfil',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.blue[800],
        onTap: _onItemTapped,
      ),
    );
  }
}
