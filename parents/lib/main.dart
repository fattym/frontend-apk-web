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
import 'features/courses/providers/course_provider.dart';
import 'router.dart';

class ParentApp extends StatelessWidget {
  const ParentApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'EduGuide Schools',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F766E),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF4F7F6),
        appBarTheme: const AppBarTheme(
          centerTitle: false,
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF0F172A),
          surfaceTintColor: Colors.transparent,
          elevation: 0,
        ),
        cardTheme: CardThemeData(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          margin: EdgeInsets.zero,
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Color(0xFF0F766E), width: 1.4),
          ),
        ),
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
          ChangeNotifierProvider(create: (ctx) => CourseProvider(apiClient: ctx.read<ApiClient>())),
        ],
        child: const ParentApp(),
      ),
  );
}
