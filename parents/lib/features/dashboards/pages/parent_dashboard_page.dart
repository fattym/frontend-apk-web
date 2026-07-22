import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/auth/auth_provider.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/stat_card.dart';

class ParentDashboardPage extends StatelessWidget {
  const ParentDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DashboardProvider>();
    final data = provider.data;
    final announcements = data['announcements'] as List<dynamic>? ?? [];
    final orders = data['orders'] as List<dynamic>? ?? [];
    final requiredItems = data['required_items'] as List<dynamic>? ?? [];
    final teachers = data['teachers'] as List<dynamic>? ?? [];

    return Scaffold(
      appBar: AppBar(title: const Text('Parent Dashboard')),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async {
                final role = context.read<AuthProvider>().user?['role'] ?? 'PARENT';
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
                    mainAxisSpacing: 8,
                    crossAxisSpacing: 8,
                    children: [
                      StatCard(label: 'Teachers', value: '${teachers.length}', color: Colors.purple),
                      StatCard(label: 'Announcements', value: '${announcements.length}', color: Colors.blue),
                      StatCard(label: 'Orders', value: '${orders.length}', color: Colors.orange),
                      StatCard(label: 'Required Items', value: '${requiredItems.length}', color: Colors.green),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (teachers.isNotEmpty) ...[
                    const Text('Child\'s Teachers',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    ...teachers.map((t) => Card(
                          child: ListTile(
                            leading: CircleAvatar(
                              child: Text((t['teacher_name'] as String?)?.isNotEmpty == true ? (t['teacher_name'] as String)[0].toUpperCase() : 'T'),
                            ),
                            title: Text('${t['teacher_name'] ?? 'Unknown Teacher'}'),
                            subtitle: Text('${t['learning_area_name'] ?? 'Class Teacher'} • ${t['stream_name'] ?? 'Unknown Class'}'),
                            trailing: IconButton(
                              icon: const Icon(Icons.message, color: Colors.blue),
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Messaging coming soon!')),
                                );
                              },
                            ),
                          ),
                        )),
                    const SizedBox(height: 16),
                  ],
                  if (requiredItems.isNotEmpty) ...[
                    const Text('Required Items',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    ...requiredItems.take(5).map((item) => Card(
                          child: ListTile(
                            title: Text(_display(item['name'])),
                            subtitle: Text('${_display(item['class_level'])} • ${_display(item['term'])}'),
                            trailing: item['is_published'] == true
                                ? const Icon(Icons.visibility, color: Colors.green)
                                : const Icon(Icons.visibility_off, color: Colors.grey),
                          ),
                        )),
                    const SizedBox(height: 8),
                    FilledButton.icon(
                      onPressed: () => context.go('/requirements'),
                      icon: const Icon(Icons.shopping_cart),
                      label: const Text('View All Required Items'),
                    ),
                    const SizedBox(height: 16),
                  ],
                  const Text('Recent Announcements',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ...announcements.take(5).map((a) => Card(
                        child: ListTile(
                          title: Text(_display(a['title'])),
                          subtitle: Text(_display(a['content']), maxLines: 2, overflow: TextOverflow.ellipsis),
                          trailing: a['is_published'] == true
                              ? const Icon(Icons.visibility, color: Colors.green)
                              : const Icon(Icons.visibility_off, color: Colors.grey),
                        ),
                      )),
                  const SizedBox(height: 16),
                  const Text('My Orders',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ...orders.take(5).map((o) => Card(
                        child: ListTile(
                          title: Text('Order #${o['id']}'),
                          subtitle: Text('Status: ${o['status']?.toString().replaceAll('_', ' ') ?? ''}'),
                          trailing: Text('KES ${o['total_amount']}'),
                        ),
                      )),
                ],
              ),
            ),
    );
  }

  String _display(dynamic value) {
    if (value is Map) return value['name']?.toString() ?? value['description']?.toString() ?? '';
    return value?.toString() ?? '';
  }
}
