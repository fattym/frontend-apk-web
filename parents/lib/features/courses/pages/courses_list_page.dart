import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/course_provider.dart';

class CoursesListPage extends StatefulWidget {
  const CoursesListPage({super.key});

  @override
  State<CoursesListPage> createState() => _CoursesListPageState();
}

class _CoursesListPageState extends State<CoursesListPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final provider = context.read<CourseProvider>();
      if (provider.courses.isEmpty && !provider.isLoading) {
        provider.fetchCourses();
      }
    });
  }

  Future<void> _refresh() => context.read<CourseProvider>().fetchCourses();

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<CourseProvider>();
    final courses = provider.courses;

    if (provider.isLoading && courses.isEmpty) {
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
            _Header(
              title: 'My Courses',
              subtitle: 'A read-only view of your published CBC classroom spaces.',
            ),
            const SizedBox(height: 16),
            if (provider.error != null) ...[
              _ErrorBanner(message: provider.error!),
              const SizedBox(height: 16),
            ],
            _StatsRow(courses: courses),
            const SizedBox(height: 18),
            if (courses.isEmpty)
              const _EmptyState(
                title: 'No courses available',
                message: 'Once your teacher publishes a course, it will appear here.',
              )
            else
              ...courses.map(
                (course) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _CourseCard(
                    course: course,
                    onTap: () async {
                      await context.read<CourseProvider>().openCourse(course['id']);
                      if (context.mounted) {
                        context.go('/courses/${course['id']}');
                      }
                    },
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  final String title;
  final String subtitle;

  const _Header({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(
          colors: [Color(0xFF0F766E), Color(0xFF134E4A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 6),
          const Text(
            'Student mode',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.6,
            ),
          ),
          const SizedBox(height: 10),
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
              color: Colors.white.withValues(alpha: 0.88),
              fontSize: 13.5,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  final List<dynamic> courses;

  const _StatsRow({required this.courses});

  @override
  Widget build(BuildContext context) {
    final published = courses.where((c) => _upper(c['status']) == 'PUBLISHED').length;
    final drafts = courses.where((c) => _upper(c['status']) != 'PUBLISHED').length;
    final lessons = courses.fold<int>(0, (sum, c) => sum + ((c['lessons'] as List?)?.length ?? 0));

    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth >= 700 ? 3 : 2;
        return GridView.count(
          crossAxisCount: columns,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.12,
          children: [
            _MiniStat(label: 'Courses', value: '${courses.length}', color: const Color(0xFF0F766E)),
            _MiniStat(label: 'Published', value: '$published', color: const Color(0xFF059669)),
            _MiniStat(label: 'Drafts', value: '$drafts', color: const Color(0xFF7C3AED)),
            if (columns == 3) _MiniStat(label: 'Lessons', value: '$lessons', color: const Color(0xFFEA580C)),
          ],
        );
      },
    );
  }

  String _upper(dynamic value) => value?.toString().toUpperCase() ?? '';
}

class _MiniStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _MiniStat({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label.toUpperCase(), style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: Color(0xFF64748B))),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: color)),
        ],
      ),
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
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
          const SizedBox(height: 6),
          Text(message, style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B))),
        ],
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  final String message;

  const _ErrorBanner({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFFECACA)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.error_outline_rounded, color: Color(0xFFB91C1C)),
          const SizedBox(width: 10),
          Expanded(child: Text(message, style: const TextStyle(fontSize: 12.5, color: Color(0xFF7F1D1D)))),
        ],
      ),
    );
  }
}

class _CourseCard extends StatelessWidget {
  final dynamic course;
  final VoidCallback onTap;

  const _CourseCard({required this.course, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final lessons = (course['lessons'] as List?) ?? const [];
    final enrolled = (course['enrolled_students'] as List?) ?? const [];
    final status = (course['status']?.toString() ?? 'draft').replaceAll('_', ' ').toUpperCase();

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(22),
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: const Color(0xFF0F766E).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: const Icon(Icons.school_rounded, color: Color(0xFF0F766E)),
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
                            course['title']?.toString() ?? 'Course',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                          ),
                        ),
                        const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _display(course['learning_area']),
                      style: const TextStyle(fontSize: 12.5, color: Color(0xFF475569)),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _Pill(label: status, color: const Color(0xFF0F766E)),
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
      return value['name']?.toString() ?? value['description']?.toString() ?? 'CBC learning area';
    }
    return value?.toString() ?? 'CBC learning area';
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
