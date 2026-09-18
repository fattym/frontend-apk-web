import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static const String baseUrl = 'https://codingclubskenya.com/api';
  final Dio dio;
  final FlutterSecureStorage secureStorage;

  ApiClient(this.dio, this.secureStorage) {
    dio.options.baseUrl = baseUrl;
    dio.options.headers['Content-Type'] = 'application/json';

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await secureStorage.read(key: 'access_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        // Dio replaces the base URL path when the request path starts with '/',
        // causing the /api prefix to be dropped. Prepend /api to preserve it.
        if (!options.path.startsWith('http') && !options.path.startsWith('/api')) {
          options.path = '/api${options.path}';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          final refreshToken = await secureStorage.read(key: 'refresh_token');
          if (refreshToken != null) {
            try {
              final response = await dio.post('/auth/refresh/', data: {'refresh': refreshToken});
              final access = response.data['access'];
              await secureStorage.write(key: 'access_token', value: access);
              error.requestOptions.headers['Authorization'] = 'Bearer $access';
              return handler.resolve(await dio.fetch(error.requestOptions));
            } catch (e) {
              await secureStorage.deleteAll();
            }
          }
        }
        return handler.next(error);
      },
    ));
  }
}
