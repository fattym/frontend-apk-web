import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/auth/auth_provider.dart';
import '../../courses/providers/course_provider.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/stat_card.dart';
import '../../../core/theme/clay_badge.dart';
import '../../../core/theme/clay_card.dart';
import '../../../core/theme/clay_button.dart';
import '../../../core/theme/clay_states.dart';
import '../../../core/theme/theme_tokens.dart';

class TeacherDashboardPage extends StatelessWidget {
  const TeacherDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DashboardProvider>();
    final data = provider.data;
    final assignments = data['assignments'] as List<dynamic>? ?? [];
    final assessments = data['assessments'] as List<dynamic>? ?? [];
    final schemes = data['schemes'] as List<dynamic>? ?? [];
    final courses = data['courses'] as List<dynamic>? ?? [];

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
                padding: const EdgeInsets.all(kSpacing16),
                children: [
                  // Top session bar (PRD §6.4) — recessed container
                  _SessionBar(),
                  const SizedBox(height: kSpacing16),
                  // Stat tiles — 3-col grid, inset clay (PRD §6.2)
                  GridView.count(
                    crossAxisCount: 3,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    childAspectRatio: 1.1,
                    crossAxisSpacing: kSpacing20,
                    mainAxisSpacing: kSpacing20,
                    children: [
                      StatCard(label: 'Classes', value: '${assignments.length}', color: kNavy),
                      StatCard(label: 'Assessments', value: '${assessments.length}', color: kNavy),
                      StatCard(label: 'Schemes', value: '${schemes.length}', color: kNavy),
                      StatCard(label: 'Courses', value: '${courses.length}', color: kNavy),
                      StatCard(label: 'Pending reviews', value: '${assessments.where((a) => (a['status']?.toString().toLowerCase() ?? '') == 'pending').length}', color: kWarning),
                      StatCard(label: 'Active streams', value: '${assignments.where((a) => (a['stream'] != null)).length}', color: kSuccess),
                      StatCard(label: 'Learning areas', value: '${_uniqueLearningAreas(assignments)}', color: kNavy),
                      StatCard(label: 'Attendance rate', value: '94%', color: kAccent),
                    ],
                  ),
                  const SizedBox(height: kSpacing16),
                  // Primary CTA — raised clay (PRD §6.1)
                  Align(
                    alignment: Alignment.centerRight,
                    child: ClayButton(
                      onPressed: () => context.go('/dashboard/trainer'),
                      label: 'Club Trainer Dashboard',
                      icon: Icons.sports,
                      clayState: ClayState.raised,
                    ),
                  ),
                  const SizedBox(height: kSpacing16),
                  // My Teaching Assignments — inset container, flush rows (PRD §6.2, §6.6)
                  ClayCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'My Teaching Assignments',
                          style: TextStyle(fontSize: kType20, fontWeight: FontWeight.w600, fontFamily: 'Baloo 2'),
                        ),
                        const SizedBox(height: kSpacing12),
                        ...assignments.take(10).map((a) => ClayRow(
                              isZebra: assignments.indexOf(a) % 2 == 1,
                              child: ListTile(
                                contentPadding: EdgeInsets.zero,
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
                  const SizedBox(height: kSpacing16),
                  // My Learning Area Content — inset container, flush rows
                  ClayCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'My Learning Area Content',
                          style: TextStyle(fontSize: kType20, fontWeight: FontWeight.w600, fontFamily: 'Baloo 2'),
                        ),
                        const SizedBox(height: kSpacing12),
                        if (courses.isEmpty)
                          const Padding(
                            padding: EdgeInsets.all(kSpacing8),
                            child: Text('No learning area content created yet.', style: TextStyle(color: Colors.grey)),
                          ),
                        ...courses.take(10).map((c) => ClayRow(
                              isZebra: courses.indexOf(c) % 2 == 1,
                              onTap: () async {
                                final courseProvider = context.read<CourseProvider>();
                                await courseProvider.openCourse(c['id']);
                                if (context.mounted) context.go('/courses/${c['id']}');
                              },
                              child: ListTile(
                                contentPadding: EdgeInsets.zero,
                                leading: Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: kInfo.withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(kRadiusSm),
                                  ),
                                  child: Icon(Icons.library_books, color: kInfo, size: 20),
                                ),
                                title: Text(c['title'] ?? ''),
                                subtitle: Text(_display(c['learning_area'])),
                                trailing: ClayBadge(
                                  label: (c['status'] ?? 'Draft').toString(),
                                  type: (c['status']?.toString().toLowerCase() == 'published'
                                      ? ClayBadgeType.success
                                      : ClayBadgeType.cloud),
                                ),
                              ),
                            )),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  String _display(dynamic value) {
    if (value is Map) return value['name']?.toString() ?? '';
    return value?.toString() ?? '';
  }

  int _uniqueLearningAreas(List<dynamic> assignments) {
    final areas = assignments.map((a) => _display(a['learning_area'])).where((a) => a.isNotEmpty).toSet();
    return areas.length;
  }
}

// Top session bar — recessed clay container (PRD §6.4, §7.2)
class _SessionBar extends StatelessWidget {
  const _SessionBar();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(kSpacing16),
      decoration: clayInsetDecoration(surface: kWhite, borderRadius: kRadiusLg),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Current session',
                  style: TextStyle(
                    fontSize: kType12,
                    fontWeight: FontWeight.w500,
                    color: kInk.withValues(alpha: 0.55),
                    fontFamily: 'Plus Jakarta Sans',
                  ),
                ),
                const SizedBox(height: kSpacing4),
                const Text(
                  'Term 2 · Week 6',
                  style: TextStyle(
                    fontSize: kType16,
                    fontWeight: FontWeight.w600,
                    fontFamily: 'Plus Jakarta Sans',
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: kSpacing12),
          ClayBadge(label: 'CBC ready', type: ClayBadgeType.info),
          const SizedBox(width: kSpacing8),
          ClayBadge(label: 'Multi-tenant', type: ClayBadgeType.cloud),
        ],
      ),
    );
  }
}
