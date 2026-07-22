import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/auth/auth_provider.dart';
import '../../courses/providers/course_provider.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/stat_card.dart';

class StudentDashboardPage extends StatefulWidget {
  const StudentDashboardPage({super.key});

  @override
  State<StudentDashboardPage> createState() => _StudentDashboardPageState();
}

class _StudentDashboardPageState extends State<StudentDashboardPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final provider = context.read<DashboardProvider>();
      if (provider.data.isEmpty && !provider.isLoading) {
        _loadDashboard();
      }
    });
  }

  Future<void> _loadDashboard() async {
    final role = context.read<AuthProvider>().user?['role'] ?? 'STUDENT';
    await context.read<DashboardProvider>().fetchDashboard(role);
  }

  Future<void> _refresh() => _loadDashboard();

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DashboardProvider>();
    final auth = context.watch<AuthProvider>();
    final data = provider.data;

    final attendance = _asList(data['attendance']);
    final assessments = _asList(data['assessments']);
    final reports = _asList(data['reports']);
    final courses = _asList(data['courses']);

    final present = attendance.where((a) => _upper(a['status']) == 'PRESENT').length;
    final absent = attendance.where((a) => _upper(a['status']) == 'ABSENT').length;
    final me = assessments.where((a) => _upper(a['level_achieved']) == 'ME').length;
    final ee = assessments.where((a) => _upper(a['level_achieved']) == 'EE').length;

    if (provider.isLoading && provider.data.isEmpty) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          children: [
            _HeroCard(
              title: 'Student Dashboard',
              subtitle: 'Track your courses, competency growth, and term progress in one place.',
              accentLabel: 'CBC Learner Space',
              meta: _displayName(auth.user),
            ),
            const SizedBox(height: 16),
            if (provider.error != null) ...[
              _Banner(
                title: 'Dashboard sync issue',
                message: provider.error!,
              ),
              const SizedBox(height: 16),
            ],
            LayoutBuilder(
              builder: (context, constraints) {
                final columns = constraints.maxWidth >= 900
                    ? 4
                    : constraints.maxWidth >= 620
                        ? 3
                        : 2;
                return GridView.count(
                  crossAxisCount: columns,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  childAspectRatio: 1.08,
                  children: [
                    StatCard(label: 'Present Days', value: '$present', color: const Color(0xFF059669)),
                    StatCard(label: 'Absent Days', value: '$absent', color: const Color(0xFFDC2626)),
                    StatCard(label: 'Meeting', value: '$me', color: const Color(0xFF2563EB)),
                    StatCard(label: 'Exceeding', value: '$ee', color: const Color(0xFF7C3AED)),
                  ],
                );
              },
            ),
            const SizedBox(height: 18),
            if (courses.isNotEmpty) ...[
              _SectionHeader(
                title: 'Continue learning',
                subtitle: 'Jump back into your latest enrolled course.',
              ),
              const SizedBox(height: 12),
              _FeaturedCourseCard(
                course: courses.first,
                onTap: () async {
                  final courseProvider = context.read<CourseProvider>();
                  await courseProvider.openCourse(courses.first['id']);
                  if (context.mounted) context.go('/courses/${courses.first['id']}');
                },
              ),
              const SizedBox(height: 18),
            ],
            _SectionHeader(
              title: 'My enrolled courses',
              subtitle: 'Open a course to view weekly topics, lessons, assignments, and stream posts.',
            ),
            const SizedBox(height: 12),
            if (courses.isEmpty)
              const _EmptyState(
                title: 'No courses enrolled yet',
                message: 'Your teacher has not published any course for your class stream.',
              )
            else
              ...courses.map(
                (course) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _CourseTile(
                    course: course,
                    onTap: () async {
                      final courseProvider = context.read<CourseProvider>();
                      await courseProvider.openCourse(course['id']);
                      if (context.mounted) context.go('/courses/${course['id']}');
                    },
                  ),
                ),
              ),
            const SizedBox(height: 8),
            _SectionHeader(
              title: 'Recent assessments',
              subtitle: 'Your latest competency results from the term.',
            ),
            const SizedBox(height: 12),
            if (assessments.isEmpty)
              const _EmptyState(
                title: 'No assessments yet',
                message: 'Assessment results will appear here once they are published.',
              )
            else
              ...assessments.take(6).map((assessment) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _AssessmentCard(assessment: assessment),
                );
              }),
            const SizedBox(height: 8),
            _SectionHeader(
              title: 'Report cards',
              subtitle: 'Review your term reports and overall performance summaries.',
            ),
            const SizedBox(height: 12),
            if (reports.isEmpty)
              const _EmptyState(
                title: 'No report cards yet',
                message: 'Term reports will appear here after publication.',
              )
            else
              ...reports.take(5).map((report) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _ReportCard(report: report),
                );
              }),
          ],
        ),
      ),
    );
  }

  List<dynamic> _asList(dynamic value) {
    if (value is List) return value;
    return const [];
  }

  String _displayName(dynamic user) {
    if (user is Map) {
      final first = user['first_name']?.toString() ?? '';
      final last = user['last_name']?.toString() ?? '';
      final full = '$first $last'.trim();
      if (full.isNotEmpty) return full;
      return user['name']?.toString() ?? user['email']?.toString() ?? 'Learner';
    }
    return 'Learner';
  }

  String _display(dynamic value) {
    if (value is Map) {
      return value['name']?.toString() ??
          value['title']?.toString() ??
          value['description']?.toString() ??
          value['sub_strand_name']?.toString() ??
          '';
    }
    return value?.toString() ?? '';
  }

  String _upper(dynamic value) => value?.toString().toUpperCase() ?? '';
}

class _HeroCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final String accentLabel;
  final String meta;

  const _HeroCard({
    required this.title,
    required this.subtitle,
    required this.accentLabel,
    required this.meta,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(
          colors: [Color(0xFF0F766E), Color(0xFF134E4A), Color(0xFF0F172A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F766E).withValues(alpha: 0.18),
            blurRadius: 28,
            offset: const Offset(0, 16),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(999),
              border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
            ),
            child: Text(
              accentLabel,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.5,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.w900,
              height: 1.05,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            subtitle,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.86),
              fontSize: 13.5,
              height: 1.45,
            ),
          ),
          if (meta.isNotEmpty) ...[
            const SizedBox(height: 16),
            Row(
              children: [
                const Icon(Icons.person_outline, color: Colors.white, size: 18),
                const SizedBox(width: 8),
                Text(
                  meta,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _Banner extends StatelessWidget {
  final String title;
  final String message;

  const _Banner({required this.title, required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFEE2E2),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFFCA5A5)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.warning_rounded, color: Color(0xFFB91C1C)),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF7F1D1D))),
                const SizedBox(height: 4),
                Text(message, style: const TextStyle(color: Color(0xFF991B1B), fontSize: 12.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final String subtitle;

  const _SectionHeader({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w900,
            color: Color(0xFF0F172A),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          subtitle,
          style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B)),
        ),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  final String title;
  final String message;

  const _EmptyState({required this.title, required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
          const SizedBox(height: 6),
          Text(message, style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B))),
        ],
      ),
    );
  }
}

class _CourseTile extends StatelessWidget {
  final dynamic course;
  final VoidCallback onTap;

  const _CourseTile({required this.course, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final learningArea = _display(course['learning_area']);
    final mode = _label(course['delivery_mode']);
    final status = _label(course['status'], fallback: 'draft');
    final lessons = (course['lessons'] as List?) ?? const [];
    final enrolled = (course['enrolled_students'] as List?) ?? const [];

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: const Color(0xFF0F766E).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.menu_book_rounded, color: Color(0xFF0F766E)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            _label(course['title'], fallback: 'Course'),
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                          ),
                        ),
                        const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      learningArea.isEmpty ? 'CBC learning area' : learningArea,
                      style: const TextStyle(fontSize: 12.5, color: Color(0xFF475569)),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _Pill(label: status.replaceAll('_', ' '), color: const Color(0xFF0F766E)),
                        _Pill(label: mode, color: const Color(0xFF334155)),
                        _Pill(label: '${lessons.length} lessons', color: const Color(0xFF7C3AED)),
                        _Pill(label: '${enrolled.length} learners', color: const Color(0xFFEA580C)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _display(dynamic value) {
    if (value is Map) {
      return value['name']?.toString() ?? value['description']?.toString() ?? '';
    }
    return value?.toString() ?? '';
  }

  String _label(dynamic value, {String fallback = ''}) {
    final text = value?.toString() ?? fallback;
    return text.replaceAll('_', ' ').trim().toUpperCase();
  }
}

class _FeaturedCourseCard extends StatelessWidget {
  final dynamic course;
  final VoidCallback onTap;

  const _FeaturedCourseCard({required this.course, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final lessons = (course['lessons'] as List?) ?? const [];
    final enrolled = (course['enrolled_students'] as List?) ?? const [];

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(24),
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            gradient: const LinearGradient(
              colors: [Color(0xFFF0FDFA), Color(0xFFFFFFFF)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 54,
                    height: 54,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F766E).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Icon(Icons.auto_stories_rounded, color: Color(0xFF0F766E)),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          course['title']?.toString() ?? 'Course',
                          style: const TextStyle(fontSize: 16.5, fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          _display(course['learning_area']),
                          style: const TextStyle(fontSize: 12.5, color: Color(0xFF475569)),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.open_in_new_rounded, color: Color(0xFF94A3B8), size: 20),
                ],
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _Pill(label: '${lessons.length} lessons', color: const Color(0xFF0F766E)),
                  _Pill(label: '${enrolled.length} learners', color: const Color(0xFF7C3AED)),
                  _Pill(label: _display(course['delivery_mode']).toUpperCase(), color: const Color(0xFF334155)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _display(dynamic value) {
    if (value is Map) {
      return value['name']?.toString() ?? value['description']?.toString() ?? '';
    }
    return value?.toString() ?? '';
  }
}

class _AssessmentCard extends StatelessWidget {
  final dynamic assessment;

  const _AssessmentCard({required this.assessment});

  @override
  Widget build(BuildContext context) {
    final level = assessment['level_achieved']?.toString().toUpperCase() ?? '-';
    final color = _color(level);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(Icons.bar_chart_rounded, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _display(assessment['outcome']).isNotEmpty
                      ? _display(assessment['outcome'])
                      : (_display(assessment['learning_outcome']).isNotEmpty
                          ? _display(assessment['learning_outcome'])
                          : 'Competency assessment'),
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14.5),
                ),
                const SizedBox(height: 6),
                Text(
                  _display(assessment['term']).isNotEmpty
                      ? _display(assessment['term'])
                      : (_display(assessment['strand']).isNotEmpty
                          ? _display(assessment['strand'])
                          : _display(assessment['subject'])),
                  style: const TextStyle(color: Color(0xFF64748B), fontSize: 12.5),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(
              level,
              style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 11.5),
            ),
          ),
        ],
      ),
    );
  }

  Color _color(String level) {
    switch (level) {
      case 'EE':
        return const Color(0xFF2563EB);
      case 'ME':
        return const Color(0xFF059669);
      case 'AE':
        return const Color(0xFFF59E0B);
      case 'BE':
        return const Color(0xFFDC2626);
      default:
        return const Color(0xFF64748B);
    }
  }

  String _display(dynamic value) {
    if (value is Map) {
      return value['name']?.toString() ??
          value['title']?.toString() ??
          value['description']?.toString() ??
          '';
    }
    return value?.toString() ?? '';
  }
}

class _ReportCard extends StatelessWidget {
  final dynamic report;

  const _ReportCard({required this.report});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: const Color(0xFF0F766E).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.description_rounded, color: Color(0xFF0F766E), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _display(report['term']).isNotEmpty ? _display(report['term']) : 'Term report',
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14.5),
                ),
                const SizedBox(height: 6),
                Text(
                  '${report['percentage'] ?? '-'}%  ·  ${_display(report['grade'])}',
                  style: const TextStyle(color: Color(0xFF64748B), fontSize: 12.5),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _display(dynamic value) {
    if (value is Map) {
      return value['name']?.toString() ?? value['title']?.toString() ?? value['description']?.toString() ?? '';
    }
    return value?.toString() ?? '';
  }
}

class _Pill extends StatelessWidget {
  final String label;
  final Color color;

  const _Pill({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}
