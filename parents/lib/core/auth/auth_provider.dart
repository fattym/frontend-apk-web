import 'package:flutter/foundation.dart';
import 'package:parent_app/core/api/api_client.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthProvider with ChangeNotifier {
  final ApiClient apiClient;
  final FlutterSecureStorage secureStorage;
  Map<String, dynamic>? _user;
  bool _isLoading = true;

  AuthProvider({required this.apiClient, required this.secureStorage}) {
    _loadUser();
  }

  Map<String, dynamic>? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;

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

  Future<bool> login(String email, String password) async {
    try {
      final response = await apiClient.dio.post('/auth/login/', data: {
        'email': email,
        'password': password,
      });
      final access = response.data['access'];
      final refresh = response.data['refresh'];
      final user = response.data['user'];
      await secureStorage.write(key: 'access_token', value: access);
      await secureStorage.write(key: 'refresh_token', value: refresh);
      _user = user;
      notifyListeners();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    await secureStorage.deleteAll();
    _user = null;
    notifyListeners();
  }
}
