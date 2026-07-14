import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/auth/auth_provider.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/stat_card.dart';

class StudentDashboardPage extends StatelessWidget {
  const StudentDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DashboardProvider>();
    final data = provider.data;
    final attendance = data['attendance'] as List<dynamic>? ?? [];
    final assessments = data['assessments'] as List<dynamic>? ?? [];
    final reports = data['reports'] as List<dynamic>? ?? [];

    final present = attendance.where((a) => a['status'] == 'PRESENT').length;
    final absent = attendance.where((a) => a['status'] == 'ABSENT').length;
    final me = assessments.where((a) => a['level_achieved'] == 'ME').length;
    final ee = assessments.where((a) => a['level_achieved'] == 'EE').length;

    return Scaffold(
      appBar: AppBar(title: const Text('Student Dashboard')),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async {
                final role = context.read<AuthProvider>().user?['role'] ?? 'STUDENT';
                await provider.fetchDashboard(role);
              },
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    childAspectRatio: 1.2,
                    children: [
                      StatCard(label: 'Present Days', value: '$present', color: Colors.green),
                      StatCard(label: 'Absent Days', value: '$absent', color: Colors.red),
                      StatCard(label: 'Meeting', value: '$me', color: Colors.blue),
                      StatCard(label: 'Exceeding', value: '$ee', color: Colors.purple),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text('Recent Competency Assessments',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ...assessments.take(10).map((a) => Card(
                        child: ListTile(
                          title: Text(_display(a['outcome'])),
                          subtitle: Text(_display(a['term'])),
                          trailing: _levelChip(a['level_achieved']),
                        ),
                      )),
                  const SizedBox(height: 16),
                  const Text('Report Cards',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ...reports.take(5).map((r) => Card(
                        child: ListTile(
                          title: Text(_display(r['term'])),
                          subtitle: Text('${r['percentage'] ?? ''}%  ·  ${r['grade'] ?? ''}'),
                        ),
                      )),
                ],
              ),
            ),
    );
  }

  Widget _levelChip(dynamic level) {
    final map = {
      'BE': Colors.red,
      'AE': Colors.orange,
      'ME': Colors.green,
      'EE': Colors.blue,
    };
    final color = map[level] ?? Colors.grey;
    return Chip(label: Text('$level'), backgroundColor: color.withValues(alpha: 0.2));
  }

  String _display(dynamic value) {
    if (value is Map) return value['name']?.toString() ?? value['description']?.toString() ?? '';
    return value?.toString() ?? '';
  }
}
