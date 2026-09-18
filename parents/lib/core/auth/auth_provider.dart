import 'package:flutter/foundation.dart';
import 'package:parent_app/core/api/api_client.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthProvider with ChangeNotifier {
  final ApiClient apiClient;
  final FlutterSecureStorage secureStorage;
  Map<String, dynamic>? _user;
  bool _isLoading = true;
  String? _error;

  AuthProvider({required this.apiClient, required this.secureStorage}) {
    _loadUser();
  }

  Map<String, dynamic>? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> _loadUser() async {
    final token = await secureStorage.read(key: 'access_token');
    if (token != null) {
      try {
        final response = await apiClient.dio.get('/auth/users/me/');
        _user = response.data;
      } catch (e) {
        await secureStorage.deleteAll();
      }
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<String?> login(String email, String password) async {
    _error = null;
    try {
      final response = await apiClient.dio.post('/auth/login/', data: {
        'email': email,
        'password': password,
      });
      final access = response.data['access'];
      final refresh = response.data['refresh'];
      await secureStorage.write(key: 'access_token', value: access);
      await secureStorage.write(key: 'refresh_token', value: refresh);
      if (response.data['user'] != null) {
        _user = response.data['user'];
      } else {
        _user = await _fetchUserProfile();
      }
      notifyListeners();
      return null;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return _error;
    }
  }

  Future<String?> studentLogin(String studentId, String pinCode) async {
    _error = null;
    try {
      final response = await apiClient.dio.post('/auth/student-login/', data: {
        'student_id': studentId,
        'pin_code': pinCode,
      });
      final access = response.data['access'];
      final refresh = response.data['refresh'];
      await secureStorage.write(key: 'access_token', value: access);
      await secureStorage.write(key: 'refresh_token', value: refresh);
      if (response.data['user'] != null) {
        _user = response.data['user'];
      } else {
        _user = await _fetchUserProfile();
      }
      notifyListeners();
      return null;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return _error;
    }
  }

  Future<Map<String, dynamic>?> _fetchUserProfile() async {
    try {
      final response = await apiClient.dio.get('/auth/users/me/');
      return response.data as Map<String, dynamic>?;
    } catch (e) {
      return null;
    }
  }

  Future<void> logout() async {
    await secureStorage.deleteAll();
    _user = null;
    _error = null;
    notifyListeners();
  }
}
