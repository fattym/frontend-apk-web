import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/course_provider.dart';
import '../../../core/auth/auth_provider.dart';

class CourseViewerPage extends StatefulWidget {
  final int courseId;

  const CourseViewerPage({super.key, required this.courseId});

  @override
  State<CourseViewerPage> createState() => _CourseViewerPageState();
}

class _CourseViewerPageState extends State<CourseViewerPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<CourseProvider>().openCourse(widget.courseId);
    });
  }

  Future<void> _reload() => context.read<CourseProvider>().openCourse(widget.courseId);

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final provider = context.watch<CourseProvider>();

    return Scaffold(
      body: Consumer<CourseProvider>(
        builder: (context, provider, child) {
          if (provider.isLoadingDetail && provider.activeCourse == null) {
            return const Center(child: CircularProgressIndicator());
          }

          final course = provider.activeCourse;
          if (course == null) {
            return const Center(child: Text('Course not found.'));
          }

          final topics = provider.topics;
          final assignments = provider.assignments;
          final posts = provider.posts;
          final lessons = _asList(course['lessons']);
          final completions = _completedLessonCount(course);
          final learnerName = _displayName(auth.user);

          return DefaultTabController(
            length: 5,
            child: SafeArea(
              child: Column(
                children: [
                  _Header(
                    course: course,
                    learnerName: learnerName,
                    onBack: () => context.go('/courses'),
                    onRefresh: _reload,
                    completionText: lessons.isEmpty ? 'No lessons yet' : '$completions of ${lessons.length} lessons ready',
                  ),
                  Container(
                    margin: const EdgeInsets.fromLTRB(16, 0, 16, 0),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: const TabBar(
                      isScrollable: true,
                      tabAlignment: TabAlignment.start,
                      labelColor: Color(0xFF0F766E),
                      unselectedLabelColor: Color(0xFF64748B),
                      indicatorColor: Color(0xFF0F766E),
                      tabs: [
                        Tab(text: 'Overview'),
                        Tab(text: 'Topics'),
                        Tab(text: 'Lessons'),
                        Tab(text: 'Assignments'),
                        Tab(text: 'Stream'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: TabBarView(
                      children: [
                        _OverviewTab(
                          course: course,
                          topics: topics,
                          assignments: assignments,
                          posts: posts,
                          lessons: lessons,
                        ),
                        _TopicsTab(
                          courseId: course['id'],
                          topics: topics,
                          assignments: assignments,
                          posts: posts,
                        ),
                        _LessonsTab(lessons: lessons),
                        _AssignmentsTab(assignments: assignments),
                        _StreamTab(posts: posts),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  int _completedLessonCount(Map<String, dynamic> course) {
    final lessons = _asList(course['lessons']);
    return lessons.where((lesson) => lesson['is_published'] == true).length;
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
      return user['name']?.toString() ?? 'Learner';
    }
    return 'Learner';
  }
}

class _Header extends StatelessWidget {
  final Map<String, dynamic> course;
  final String learnerName;
  final VoidCallback onBack;
  final VoidCallback onRefresh;
  final String completionText;

  const _Header({
    required this.course,
    required this.learnerName,
    required this.onBack,
    required this.onRefresh,
    required this.completionText,
  });

  @override
  Widget build(BuildContext context) {
    final mode = _label(course['delivery_mode'], fallback: 'blended');
    final status = _label(course['status'], fallback: 'draft');
    final lessons = (course['lessons'] as List?) ?? const [];
    final learners = (course['enrolled_students'] as List?) ?? const [];

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(28),
          gradient: const LinearGradient(
            colors: [Color(0xFF0F766E), Color(0xFF134E4A), Color(0xFF0F172A)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _Pill(label: 'Student view', color: Colors.white),
                const Spacer(),
                IconButton(
                  onPressed: onRefresh,
                  icon: const Icon(Icons.refresh_rounded, color: Colors.white),
                  tooltip: 'Refresh',
                ),
                IconButton(
                  onPressed: onBack,
                  icon: const Icon(Icons.close_rounded, color: Colors.white),
                  tooltip: 'Back to courses',
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              course['title']?.toString() ?? 'Course',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.w900,
                height: 1.05,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              _display(course['description']).isNotEmpty
                  ? _display(course['description'])
                  : 'Read-only CBC classroom space for weekly topics, lesson notes, and assignments.',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.86),
                fontSize: 13.5,
                height: 1.45,
              ),
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _Pill(label: mode, color: Colors.white),
                _Pill(label: status, color: Colors.white),
                _Pill(label: '${lessons.length} lessons', color: Colors.white),
                _Pill(label: '${learners.length} learners', color: Colors.white),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                const Icon(Icons.person_outline, color: Colors.white, size: 18),
                const SizedBox(width: 8),
                Text(
                  learnerName,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
                ),
                const Spacer(),
                Text(
                  completionText,
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.82), fontSize: 12.5),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _label(dynamic value, {String fallback = ''}) {
    final text = value?.toString() ?? fallback;
    return text.replaceAll('_', ' ').trim().toUpperCase();
  }

  String _display(dynamic value) {
    if (value is Map) {
      return value['name']?.toString() ?? value['description']?.toString() ?? '';
    }
    return value?.toString() ?? '';
  }
}

class _OverviewTab extends StatelessWidget {
  final Map<String, dynamic> course;
  final List<dynamic> topics;
  final List<dynamic> assignments;
  final List<dynamic> posts;
  final List<dynamic> lessons;

  const _OverviewTab({
    required this.course,
    required this.topics,
    required this.assignments,
    required this.posts,
    required this.lessons,
  });

  @override
  Widget build(BuildContext context) {
    final competencies = _asList(course['core_competencies']);
    final values = _asList(course['values']);
    final pcis = _asList(course['pcis']);

    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      children: [
        _InfoCard(
          title: 'About this class',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                course['description']?.toString().isNotEmpty == true
                    ? course['description'].toString()
                    : 'No course description has been published yet.',
                style: const TextStyle(fontSize: 13.5, height: 1.5, color: Color(0xFF334155)),
              ),
              const SizedBox(height: 14),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _Pill(label: _display(course['learning_area'], fallback: 'Learning Area'), color: const Color(0xFF0F766E)),
                  _Pill(label: _display(course['section'], fallback: 'Section'), color: const Color(0xFF334155)),
                  _Pill(label: _display(course['room'], fallback: 'Room'), color: const Color(0xFF334155)),
                  _Pill(label: _display(course['delivery_mode'], fallback: 'Mode').replaceAll('_', ' ').toUpperCase(), color: const Color(0xFF7C3AED)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        _StatsGrid(
          items: [
            _StatItem(label: 'Topics', value: topics.length, color: const Color(0xFF0F766E)),
            _StatItem(label: 'Lessons', value: lessons.length, color: const Color(0xFF7C3AED)),
            _StatItem(label: 'Assignments', value: assignments.length, color: const Color(0xFFEA580C)),
            _StatItem(label: 'Posts', value: posts.length, color: const Color(0xFF2563EB)),
          ],
        ),
        const SizedBox(height: 12),
        _InfoCard(
          title: 'CBC alignment',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _ChipSection(title: 'Core competencies', items: competencies),
              const SizedBox(height: 12),
              _ChipSection(title: 'Values', items: values),
              const SizedBox(height: 12),
              _ChipSection(title: 'PCIs', items: pcis),
            ],
          ),
        ),
        const SizedBox(height: 12),
        _InfoCard(
          title: 'Publishing controls',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _ToggleLine(
                label: 'Parent unlock',
                value: course['requires_parent_unlock'] == true ? 'Enabled' : 'Disabled',
              ),
              const SizedBox(height: 8),
              _ToggleLine(
                label: 'Student posts',
                value: course['allow_student_posts'] == true ? 'Enabled' : 'Disabled',
              ),
              const SizedBox(height: 8),
              _ToggleLine(
                label: 'Available from',
                value: _date(course['available_from']),
              ),
            ],
          ),
        ),
      ],
    );
  }

  List<dynamic> _asList(dynamic value) {
    if (value is List) return value;
    return const [];
  }

  String _display(dynamic value, {String fallback = ''}) {
    if (value is Map) {
      return value['name']?.toString() ?? value['title']?.toString() ?? value['description']?.toString() ?? fallback;
    }
    return value?.toString().isNotEmpty == true ? value.toString() : fallback;
  }

  String _date(dynamic value) {
    if (value == null) return 'Not set';
    final dt = DateTime.tryParse(value.toString());
    if (dt == null) return value.toString();
    final local = dt.toLocal();
    return '${local.year}-${local.month.toString().padLeft(2, '0')}-${local.day.toString().padLeft(2, '0')}';
  }
}

class _TopicsTab extends StatelessWidget {
  final dynamic courseId;
  final List<dynamic> topics;
  final List<dynamic> assignments;
  final List<dynamic> posts;

  const _TopicsTab({
    required this.courseId,
    required this.topics,
    required this.assignments,
    required this.posts,
  });

  @override
  Widget build(BuildContext context) {
    if (topics.isEmpty) {
      return const _EmptyPanel(
        title: 'No topics yet',
        message: 'Your teacher will generate weekly topics from the Scheme of Work.',
      );
    }

    final grouped = <int, List<dynamic>>{};
    for (final topic in topics) {
      final week = _toInt(topic['week']) ?? _toInt(topic['week_number']) ?? 0;
      grouped.putIfAbsent(week, () => []).add(topic);
    }
    final weeks = grouped.keys.toList()..sort();

    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      children: weeks.map((week) {
        final weekTopics = grouped[week] ?? const [];
        return Padding(
          padding: const EdgeInsets.only(bottom: 14),
          child: _InfoCard(
            title: week == 0 ? 'Topics' : 'Week $week',
            child: Column(
              children: weekTopics.map((topic) {
                final topicAssignments = assignments.where((a) => _toInt(a['topic']) == _toInt(topic['id'])).toList();
                final topicPosts = posts.where((p) => _toInt(p['topic']) == _toInt(topic['id'])).toList();
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Material(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(18),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(18),
                      onTap: () {
                        context.go('/courses/$courseId/topics/${topic['id']}');
                      },
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    topic['title']?.toString() ?? topic['name']?.toString() ?? 'Topic',
                                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                                  ),
                                ),
                                const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _display(topic['learning_outcomes']),
                              style: const TextStyle(fontSize: 12.5, color: Color(0xFF475569), height: 1.45),
                            ),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: [
                                _Pill(label: 'Order ${_toInt(topic['order_index']) ?? _toInt(topic['order']) ?? 1}', color: const Color(0xFF0F766E)),
                                _Pill(label: '${topicAssignments.length} assignments', color: const Color(0xFFEA580C)),
                                _Pill(label: '${topicPosts.length} posts', color: const Color(0xFF2563EB)),
                                _Pill(label: _label(topic['status'], fallback: 'draft'), color: const Color(0xFF7C3AED)),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        );
      }).toList(),
    );
  }

  String _display(dynamic value) {
    if (value is List) {
      return value
          .map((item) => item is Map ? item['name']?.toString() ?? item['description']?.toString() ?? '' : item?.toString() ?? '')
          .where((item) => item.trim().isNotEmpty)
          .join(' • ');
    }
    if (value is Map) {
      return value['name']?.toString() ?? value['description']?.toString() ?? '';
    }
    return value?.toString() ?? '';
  }

  String _label(dynamic value, {String fallback = ''}) {
    final text = value?.toString() ?? fallback;
    return text.replaceAll('_', ' ').trim().toUpperCase();
  }

  int? _toInt(dynamic value) {
    if (value is int) return value;
    return int.tryParse(value?.toString() ?? '');
  }
}

class _LessonsTab extends StatelessWidget {
  final List<dynamic> lessons;

  const _LessonsTab({required this.lessons});

  @override
  Widget build(BuildContext context) {
    if (lessons.isEmpty) {
      return const _EmptyPanel(
        title: 'No lessons published',
        message: 'Lesson notes will appear here once your teacher publishes them.',
      );
    }

    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      itemCount: lessons.length,
      itemBuilder: (context, index) {
        final lesson = lessons[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _InfoCard(
            title: 'Lesson ${index + 1}',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  lesson['title']?.toString() ?? lesson['strand']?.toString() ?? 'Lesson',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 8),
                if (_text(lesson['strand']).isNotEmpty)
                  _DetailLine(label: 'Strand', value: _text(lesson['strand'])),
                if (_text(lesson['sub_strand']).isNotEmpty)
                  _DetailLine(label: 'Sub-strand', value: _text(lesson['sub_strand'])),
                if (_text(lesson['objectives']).isNotEmpty)
                  _DetailLine(label: 'Outcomes', value: _text(lesson['objectives'])),
                if (_text(lesson['learning_activities']).isNotEmpty)
                  _DetailLine(label: 'Activities', value: _text(lesson['learning_activities'])),
                if (_text(lesson['resources']).isNotEmpty)
                  _DetailLine(label: 'Resources', value: _text(lesson['resources'])),
                if (_text(lesson['assessment']).isNotEmpty)
                  _DetailLine(label: 'Assessment', value: _text(lesson['assessment'])),
                if (_text(lesson['content']).isNotEmpty)
                  _DetailLine(label: 'Notes', value: _text(lesson['content'])),
                if (_text(lesson['video_url']).isNotEmpty)
                  _DetailLine(label: 'Video', value: _text(lesson['video_url'])),
                if (_text(lesson['attachment']).isNotEmpty)
                  _DetailLine(label: 'Attachment', value: _text(lesson['attachment'])),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _AssignmentsTab extends StatelessWidget {
  final List<dynamic> assignments;

  const _AssignmentsTab({required this.assignments});

  @override
  Widget build(BuildContext context) {
    if (assignments.isEmpty) {
      return const _EmptyPanel(
        title: 'No assignments yet',
        message: 'Your teacher has not published any assignment for this course.',
      );
    }

    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      itemCount: assignments.length,
      itemBuilder: (context, index) {
        final assignment = assignments[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _InfoCard(
            title: assignment['title']?.toString() ?? 'Assignment',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (_text(assignment['instructions']).isNotEmpty)
                  _DetailLine(label: 'Instructions', value: _text(assignment['instructions'])),
                if (_text(assignment['due_date']).isNotEmpty)
                  _DetailLine(label: 'Due date', value: _date(assignment['due_date'])),
                if (_text(assignment['topic']).isNotEmpty)
                  _DetailLine(label: 'Topic', value: _text(assignment['topic'])),
                if (_text(assignment['attachment']).isNotEmpty)
                  _DetailLine(label: 'Attachment', value: _text(assignment['attachment'])),
                if (_text(assignment['submission_type']).isNotEmpty)
                  _DetailLine(label: 'Submission type', value: _text(assignment['submission_type'])),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _StreamTab extends StatelessWidget {
  final List<dynamic> posts;

  const _StreamTab({required this.posts});

  @override
  Widget build(BuildContext context) {
    if (posts.isEmpty) {
      return const _EmptyPanel(
        title: 'No stream posts yet',
        message: 'Announcements and class posts will show here when published.',
      );
    }

    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      itemCount: posts.length,
      itemBuilder: (context, index) {
        final post = posts[index];
        final comments = (post['comment_count'] as int?) ?? 0;
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _InfoCard(
            title: post['title']?.toString().isNotEmpty == true ? post['title'].toString() : 'Class post',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _Pill(label: _label(post['post_type'], fallback: 'post'), color: const Color(0xFF0F766E)),
                    if (_text(post['created_by']).isNotEmpty)
                      _Pill(label: _text(post['created_by']), color: const Color(0xFF334155)),
                    _Pill(label: '$comments comments', color: const Color(0xFF2563EB)),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  _text(post['content']),
                  style: const TextStyle(fontSize: 13.5, height: 1.5, color: Color(0xFF334155)),
                ),
                if (_text(post['attachment']).isNotEmpty) ...[
                  const SizedBox(height: 10),
                  _DetailLine(label: 'Attachment', value: _text(post['attachment'])),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}

class _InfoCard extends StatelessWidget {
  final String title;
  final Widget child;

  const _InfoCard({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 13.5,
              fontWeight: FontWeight.w900,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _StatsGrid extends StatelessWidget {
  final List<_StatItem> items;

  const _StatsGrid({required this.items});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth >= 700 ? 4 : 2;
        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: items.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: columns,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.15,
          ),
          itemBuilder: (context, index) => _SmallStat(item: items[index]),
        );
      },
    );
  }
}

class _SmallStat extends StatelessWidget {
  final _StatItem item;

  const _SmallStat({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(item.label.toUpperCase(), style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: Color(0xFF64748B))),
          const SizedBox(height: 8),
          Text('${item.value}', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900, color: item.color)),
        ],
      ),
    );
  }
}

class _StatItem {
  final String label;
  final int value;
  final Color color;

  const _StatItem({required this.label, required this.value, required this.color});
}

class _ToggleLine extends StatelessWidget {
  final String label;
  final String value;

  const _ToggleLine({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(label, style: const TextStyle(fontSize: 12.5, color: Color(0xFF475569), fontWeight: FontWeight.w700)),
        ),
        Text(value, style: const TextStyle(fontSize: 12.5, color: Color(0xFF0F172A), fontWeight: FontWeight.w800)),
      ],
    );
  }
}

class _ChipSection extends StatelessWidget {
  final String title;
  final List<dynamic> items;

  const _ChipSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: Color(0xFF334155))),
        const SizedBox(height: 8),
        if (items.isEmpty)
          const Text('Not set', style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B)))
        else
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: items.map((item) => _Chip(label: _text(item), color: const Color(0xFF0F766E))).toList(),
          ),
      ],
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final Color color;

  const _Chip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label.isEmpty ? 'Not set' : label,
        style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w800),
      ),
    );
  }
}

class _DetailLine extends StatelessWidget {
  final String label;
  final String value;

  const _DetailLine({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 90,
            child: Text(
              label,
              style: const TextStyle(fontSize: 12.2, fontWeight: FontWeight.w800, color: Color(0xFF64748B)),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 12.8, height: 1.45, color: Color(0xFF0F172A)),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyPanel extends StatelessWidget {
  final String title;
  final String message;

  const _EmptyPanel({required this.title, required this.message});

  @override
  Widget build(BuildContext context) {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      children: [
        Container(
          padding: const EdgeInsets.all(18),
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
        ),
      ],
    );
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

String _label(dynamic value, {String fallback = ''}) {
  final text = value?.toString() ?? fallback;
  return text.replaceAll('_', ' ').trim().toUpperCase();
}

String _text(dynamic value) {
  if (value is Map) {
    return value['name']?.toString() ??
        value['title']?.toString() ??
        value['description']?.toString() ??
        value['content']?.toString() ??
        '';
  }
  return value?.toString() ?? '';
}

int? _toInt(dynamic value) {
  if (value is int) return value;
  return int.tryParse(value?.toString() ?? '');
}

String _date(dynamic value) {
  if (value == null) return 'Not set';
  final dt = DateTime.tryParse(value.toString());
  if (dt == null) return value.toString();
  final local = dt.toLocal();
  return '${local.year}-${local.month.toString().padLeft(2, '0')}-${local.day.toString().padLeft(2, '0')}';
}
