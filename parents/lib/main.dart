import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'core/auth/auth_provider.dart';
import 'core/api/api_client.dart';
import 'features/shop/providers/shop_provider.dart';
import 'features/announcements/providers/announcements_provider.dart';
import 'features/dashboards/providers/dashboard_provider.dart';
import 'features/requirements/providers/requirements_provider.dart';
import 'router.dart';

class ParentApp extends StatelessWidget {
  const ParentApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'EduGuide Schools',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      routerConfig: router,
    );
  }
}

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  final secureStorage = const FlutterSecureStorage();
  final dio = Dio();
  final apiClient = ApiClient(dio, secureStorage);

  runApp(
      MultiProvider(
        providers: [
          Provider<FlutterSecureStorage>(create: (_) => secureStorage),
          Provider<ApiClient>(create: (_) => apiClient),
          ChangeNotifierProvider(
            create: (ctx) => AuthProvider(
              apiClient: ctx.read<ApiClient>(),
              secureStorage: ctx.read<FlutterSecureStorage>(),
            ),
          ),
          ChangeNotifierProvider(create: (ctx) => ShopProvider(apiClient: ctx.read<ApiClient>())),
          ChangeNotifierProvider(create: (ctx) => AnnouncementsProvider(apiClient: ctx.read<ApiClient>())),
          ChangeNotifierProvider(create: (ctx) => DashboardProvider(apiClient: ctx.read<ApiClient>())),
          ChangeNotifierProvider(create: (ctx) => RequirementsProvider(apiClient: ctx.read<ApiClient>())),
        ],
        child: const ParentApp(),
      ),
  );
}
