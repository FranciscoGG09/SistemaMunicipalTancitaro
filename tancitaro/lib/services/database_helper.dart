import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  factory DatabaseHelper() => _instance;
  static Database? _database;

  DatabaseHelper._internal();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), 'tancitaro_app.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE reportes_pendientes(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        descripcion TEXT,
        categoria TEXT,
        latitud REAL,
        longitud REAL,
        foto_path TEXT,
        fecha TEXT
      )
    ''');
  }

  Future<int> insertReporte(Map<String, dynamic> row) async {
    Database db = await database;
    return await db.insert('reportes_pendientes', row);
  }

  Future<List<Map<String, dynamic>>> getReportesPendientes() async {
    Database db = await database;
    return await db.query('reportes_pendientes');
  }

  Future<int> deleteReporte(int id) async {
    Database db = await database;
    return await db
        .delete('reportes_pendientes', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> clearReportes() async {
    Database db = await database;
    await db.delete('reportes_pendientes');
  }
}
