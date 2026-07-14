import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/auth/auth_provider.dart';
import '../providers/dashboard_provider.dart';
import 'teacher_dashboard_page.dart';
import 'student_dashboard_page.dart';
import 'trainer_dashboard_page.dart';

/// Renders the dashboard matching the logged-in user's role.
class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  @override
  void initState() {
    super.initState();
    final role = context.read<AuthProvider>().user?['role'] ?? '';
    Future.microtask(() => context.read<DashboardProvider>().fetchDashboard(role));
  }

  @override
  Widget build(BuildContext context) {
    final role = context.watch<AuthProvider>().user?['role'] ?? '';
    if (role == 'STUDENT') return const StudentDashboardPage();
    if (role == 'TEACHER' || role == 'STAFF') return const TeacherDashboardPage();
    return const TrainerDashboardPage();
  }
}
