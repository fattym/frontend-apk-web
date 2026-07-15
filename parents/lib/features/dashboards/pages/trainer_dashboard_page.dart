import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/auth/auth_provider.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/stat_card.dart';

class TrainerDashboardPage extends StatelessWidget {
  const TrainerDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DashboardProvider>();
    final data = provider.data;
    final clubs = data['clubs'] as List<dynamic>? ?? [];
    final sessions = data['sessions'] as List<dynamic>? ?? [];

    return Scaffold(
      appBar: AppBar(title: const Text('Club Trainer Dashboard')),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async {
                final role = context.read<AuthProvider>().user?['role'] ?? '';
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
                      StatCard(label: 'Clubs', value: '${clubs.length}', color: Colors.green),
                      StatCard(label: 'Sessions Logged', value: '${sessions.length}', color: Colors.teal),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text('My Clubs',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ...clubs.take(10).map((c) => Card(
                        child: ListTile(
                          title: Text('${c['name'] ?? ''}'),
                          subtitle: Text('${(c['trainers'] as List?)?.length ?? 0} trainer(s)'),
                          trailing: c['is_active'] == true
                              ? const Icon(Icons.check_circle, color: Colors.green)
                              : const Icon(Icons.pause_circle, color: Colors.grey),
                        ),
                      )),
                  const SizedBox(height: 16),
                  const Text('Recent Sessions',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ...sessions.take(10).map((s) => Card(
                        child: ListTile(
                          title: Text('${s['topic'] ?? ''}'),
                          subtitle: Text('${_display(s['club'])} · ${_date(s['date'])}'),
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

  String _date(dynamic value) {
    if (value == null) return '';
    try {
      final d = DateTime.parse(value.toString());
      return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
    } catch (_) {
      return value.toString();
    }
  }
}
