import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/auth/auth_provider.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/stat_card.dart';

class TeacherDashboardPage extends StatelessWidget {
  const TeacherDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DashboardProvider>();
    final data = provider.data;
    final assignments = data['assignments'] as List<dynamic>? ?? [];
    final assessments = data['assessments'] as List<dynamic>? ?? [];
    final schemes = data['schemes'] as List<dynamic>? ?? [];

    return Scaffold(
      appBar: AppBar(title: const Text('Teacher Dashboard')),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async {
                final role = context.read<AuthProvider>().user?['role'] ?? 'TEACHER';
                await provider.fetchDashboard(role);
              },
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  GridView.count(
                    crossAxisCount: 3,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    childAspectRatio: 1.1,
                    children: [
                      StatCard(label: 'Classes', value: '${assignments.length}', color: Colors.indigo),
                      StatCard(label: 'Assessments', value: '${assessments.length}', color: Colors.pink),
                      StatCard(label: 'Schemes', value: '${schemes.length}', color: Colors.purple),
                    ],
                  ),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: () => context.go('/dashboard/trainer'),
                    icon: const Icon(Icons.sports),
                    label: const Text('Club Trainer Dashboard'),
                  ),
                  const SizedBox(height: 16),
                  const Text('My Teaching Assignments',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ...assignments.take(10).map((a) => Card(
                        child: ListTile(
                          title: Text(_display(a['stream'])),
                          subtitle: Text(_display(a['learning_area']) == ''
                              ? 'Whole class'
                              : _display(a['learning_area'])),
                          trailing: Text('${a['role'] ?? ''}'),
                        ),
                      )),
                ],
              ),
            ),
    );
  }

  String _display(dynamic value) {
    if (value is Map) return value['name']?.toString() ?? '';
    return value?.toString() ?? '';
  }
}
