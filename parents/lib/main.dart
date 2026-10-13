import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'core/auth/auth_provider.dart';
import 'core/api/api_client.dart';
import 'core/theme/theme_provider.dart';
import 'features/shop/providers/shop_provider.dart';
import 'features/announcements/providers/announcements_provider.dart';
import 'features/dashboards/providers/dashboard_provider.dart';
import 'features/requirements/providers/requirements_provider.dart';
import 'features/courses/providers/course_provider.dart';
import 'features/timetable/providers/timetable_provider.dart';
import 'features/exams/providers/exam_results_provider.dart';
import 'features/messaging/providers/chat_provider.dart';
import 'features/transport/providers/transport_provider.dart';
import 'features/teacher/providers/assessment_provider.dart';
import 'features/health/providers/health_provider.dart';
import 'features/discipline/providers/discipline_provider.dart';
import 'features/alumni/providers/alumni_provider.dart';
import 'features/parent_meetings/providers/ptm_provider.dart';
import 'features/payroll/providers/payroll_provider.dart';
import 'router.dart';
import 'core/theme/app_theme.dart';

class ParentApp extends StatelessWidget {
  const ParentApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    return MaterialApp.router(
      title: 'EduGuide Schools',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: themeProvider.isInitialized
          ? themeProvider.themeMode
          : ThemeMode.light,
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
        ChangeNotifierProvider(create: (_) => ThemeProvider(secureStorage)),
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
        ChangeNotifierProvider(create: (ctx) => TimetableProvider(apiClient: ctx.read<ApiClient>())),
        ChangeNotifierProvider(create: (ctx) => ExamResultsProvider(apiClient: ctx.read<ApiClient>())),
        ChangeNotifierProvider(
          create: (ctx) => TransportProvider(
            apiClient: ctx.read<ApiClient>(),
            authProvider: ctx.read<AuthProvider>(),
          ),
        ),
        ChangeNotifierProvider(create: (ctx) => ChatProvider(apiClient: ctx.read<ApiClient>())),
        ChangeNotifierProvider(create: (ctx) => AssessmentProvider(apiClient: ctx.read<ApiClient>())),
        ChangeNotifierProvider(create: (ctx) => HealthProvider(apiClient: ctx.read<ApiClient>())),
        ChangeNotifierProvider(create: (ctx) => DisciplineProvider(apiClient: ctx.read<ApiClient>())),
        ChangeNotifierProvider(create: (ctx) => AlumniProvider(apiClient: ctx.read<ApiClient>())),
        ChangeNotifierProvider(create: (ctx) => PtmProvider(apiClient: ctx.read<ApiClient>())),
        ChangeNotifierProvider(create: (ctx) => PayrollProvider(apiClient: ctx.read<ApiClient>())),
      ],
      child: const ParentApp(),
    ),
  );
}
