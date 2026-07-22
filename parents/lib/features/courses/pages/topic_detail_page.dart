import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/course_provider.dart';

class TopicDetailPage extends StatefulWidget {
  final int courseId;
  final int topicId;

  const TopicDetailPage({
    super.key,
    required this.courseId,
    required this.topicId,
  });

  @override
  State<TopicDetailPage> createState() => _TopicDetailPageState();
}

class _TopicDetailPageState extends State<TopicDetailPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<CourseProvider>().openTopic(widget.topicId);
    });
  }

  Future<void> _reload() => context.read<CourseProvider>().openTopic(widget.topicId);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<CourseProvider>(
        builder: (context, provider, child) {
          if (provider.isLoadingTopic && provider.activeTopic == null) {
            return const Center(child: CircularProgressIndicator());
          }

          final topic = provider.activeTopic;
          if (topic == null) {
            return const Center(child: Text('Topic not found.'));
          }

          final course = provider.activeCourse;
          final lessons = _asList(topic['lessons']);
          final assignments = _asList(topic['assignments']);
          final posts = _asList(topic['posts']);
          final comments = _asList(topic['comments']);
          final learningOutcomes = _asList(topic['learning_outcomes']);

          return SafeArea(
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              children: [
                _Hero(
                  topic: topic,
                  courseTitle: _display(course?['title'], fallback: 'Course'),
                  onBack: () => context.go('/courses/${widget.courseId}'),
                  onRefresh: _reload,
                ),
                const SizedBox(height: 16),
                _Card(
                  title: 'Weekly snapshot',
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _Pill(label: _weekLabel(topic), color: const Color(0xFF0F766E)),
                      _Pill(label: _statusLabel(topic), color: const Color(0xFF7C3AED)),
                      _Pill(label: _display(topic['sub_strand_detail'], fallback: _display(topic['sub_strand'], fallback: 'Sub-strand')), color: const Color(0xFF334155)),
                      _Pill(label: '${lessons.length} lessons', color: const Color(0xFFEA580C)),
                      _Pill(label: '${assignments.length} assignments', color: const Color(0xFF2563EB)),
                      _Pill(label: '${posts.length} posts', color: const Color(0xFF059669)),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                _Card(
                  title: 'Learning outcomes',
                  child: _ListText(
                    items: learningOutcomes.isEmpty
                        ? const ['No learning outcomes published yet.']
                        : learningOutcomes.map((item) => _display(item)).where((item) => item.isNotEmpty).toList(),
                  ),
                ),
                const SizedBox(height: 12),
                if (lessons.isNotEmpty) ...[
                  _SectionTitle(title: 'Lesson notes', subtitle: 'Read-only classroom notes and lesson detail.'),
                  const SizedBox(height: 10),
                  ...lessons.map((lesson) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _LessonCard(lesson: lesson),
                      )),
                ],
                if (assignments.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  _SectionTitle(title: 'Assignments', subtitle: 'Tasks linked to this weekly topic.'),
                  const SizedBox(height: 10),
                  ...assignments.map((assignment) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _AssignmentCard(assignment: assignment),
                      )),
                ],
                if (posts.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  _SectionTitle(title: 'Class stream', subtitle: 'Teacher posts and discussion are shown read-only.'),
                  const SizedBox(height: 10),
                  ...posts.map((post) {
                    final postComments = comments.where((comment) => _toInt(comment['post']) == _toInt(post['id'])).toList();
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _PostCard(
                        post: post,
                        comments: postComments,
                      ),
                    );
                  }),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  List<dynamic> _asList(dynamic value) {
    if (value is List) return value;
    return const [];
  }
}

class _Hero extends StatelessWidget {
  final Map<String, dynamic> topic;
  final String courseTitle;
  final VoidCallback onBack;
  final VoidCallback onRefresh;

  const _Hero({
    required this.topic,
    required this.courseTitle,
    required this.onBack,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
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
              _Pill(label: 'Read-only topic', color: Colors.white),
              const Spacer(),
              IconButton(
                onPressed: onRefresh,
                icon: const Icon(Icons.refresh_rounded, color: Colors.white),
                tooltip: 'Refresh',
              ),
              IconButton(
                onPressed: onBack,
                icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
                tooltip: 'Back to course',
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            _display(topic['title'], fallback: 'Topic'),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.w900,
              height: 1.05,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            courseTitle,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.84),
              fontSize: 13.5,
            ),
          ),
          const SizedBox(height: 14),
          Text(
            _display(topic['description'], fallback: _display(topic['learning_outcomes'], fallback: '')),
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

class _Card extends StatelessWidget {
  final String title;
  final Widget child;

  const _Card({required this.title, required this.child});

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
            style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  final String subtitle;

  const _SectionTitle({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
        const SizedBox(height: 4),
        Text(subtitle, style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B))),
      ],
    );
  }
}

class _LessonCard extends StatelessWidget {
  final dynamic lesson;

  const _LessonCard({required this.lesson});

  @override
  Widget build(BuildContext context) {
    return _Card(
      title: _display(lesson['title'], fallback: 'Lesson'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _Pill(label: _display(lesson['strand'], fallback: 'Strand'), color: const Color(0xFF0F766E)),
              _Pill(label: _display(lesson['sub_strand'], fallback: 'Sub-strand'), color: const Color(0xFF334155)),
              _Pill(label: _lessonStatus(lesson), color: const Color(0xFF7C3AED)),
            ],
          ),
          const SizedBox(height: 12),
          if (_display(lesson['objectives']).isNotEmpty) _DetailLine(label: 'Outcomes', value: _display(lesson['objectives'])),
          if (_display(lesson['learning_activities']).isNotEmpty) _DetailLine(label: 'Activities', value: _display(lesson['learning_activities'])),
          if (_display(lesson['resources']).isNotEmpty) _DetailLine(label: 'Resources', value: _display(lesson['resources'])),
          if (_display(lesson['assessment']).isNotEmpty) _DetailLine(label: 'Assessment', value: _display(lesson['assessment'])),
          if (_display(lesson['content']).isNotEmpty) _DetailLine(label: 'Notes', value: _display(lesson['content'])),
          if (_display(lesson['video_url']).isNotEmpty) _DetailLine(label: 'Video', value: _display(lesson['video_url'])),
          if (_display(lesson['attachment']).isNotEmpty) _DetailLine(label: 'Attachment', value: _display(lesson['attachment'])),
        ],
      ),
    );
  }
}

class _AssignmentCard extends StatelessWidget {
  final dynamic assignment;

  const _AssignmentCard({required this.assignment});

  @override
  Widget build(BuildContext context) {
    return _Card(
      title: _display(assignment['title'], fallback: 'Assignment'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_display(assignment['instructions']).isNotEmpty)
            _DetailLine(label: 'Instructions', value: _display(assignment['instructions'])),
          if (_display(assignment['due_date']).isNotEmpty)
            _DetailLine(label: 'Due date', value: _date(assignment['due_date'])),
          if (_display(assignment['topic']).isNotEmpty)
            _DetailLine(label: 'Topic', value: _display(assignment['topic'])),
          if (_display(assignment['attachment']).isNotEmpty)
            _DetailLine(label: 'Attachment', value: _display(assignment['attachment'])),
        ],
      ),
    );
  }
}

class _PostCard extends StatelessWidget {
  final dynamic post;
  final List<dynamic> comments;

  const _PostCard({required this.post, required this.comments});

  @override
  Widget build(BuildContext context) {
    return _Card(
      title: _display(post['title'], fallback: 'Class post'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _Pill(label: _postType(post), color: const Color(0xFF0F766E)),
              if (_display(post['created_by']).isNotEmpty)
                _Pill(label: _display(post['created_by']), color: const Color(0xFF334155)),
              _Pill(label: '${comments.length} comments', color: const Color(0xFF2563EB)),
            ],
          ),
          const SizedBox(height: 12),
          if (_display(post['content']).isNotEmpty)
            Text(
              _display(post['content']),
              style: const TextStyle(fontSize: 13.5, height: 1.5, color: Color(0xFF334155)),
            ),
          if (_display(post['attachment']).isNotEmpty) ...[
            const SizedBox(height: 10),
            _DetailLine(label: 'Attachment', value: _display(post['attachment'])),
          ],
          if (comments.isNotEmpty) ...[
            const SizedBox(height: 14),
            const Text(
              'Comments',
              style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 8),
            ...comments.map(
              (comment) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _display(comment['user_name'], fallback: 'Learner'),
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _display(comment['message']),
                        style: const TextStyle(fontSize: 12.5, height: 1.45, color: Color(0xFF475569)),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ListText extends StatelessWidget {
  final List<String> items;

  const _ListText({required this.items});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const Text('Not set', style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B)));
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: items
          .map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    margin: const EdgeInsets.only(top: 7),
                    decoration: const BoxDecoration(
                      color: Color(0xFF0F766E),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      item,
                      style: const TextStyle(fontSize: 12.8, height: 1.45, color: Color(0xFF334155)),
                    ),
                  ),
                ],
              ),
            ),
          )
          .toList(),
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
            width: 88,
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

String _display(dynamic value, {String fallback = ''}) {
  if (value is Map) {
    return value['name']?.toString() ??
        value['title']?.toString() ??
        value['description']?.toString() ??
        value['content']?.toString() ??
        fallback;
  }
  final text = value?.toString() ?? '';
  return text.isNotEmpty ? text : fallback;
}

String _statusLabel(dynamic topic) {
  final value = topic is Map ? topic['status']?.toString() : '';
  if (value == null || value.isEmpty) return 'DRAFT';
  return value.replaceAll('_', ' ').toUpperCase();
}

String _weekLabel(dynamic topic) {
  final week = topic is Map ? (topic['week'] ?? topic['week_number']) : null;
  return week == null ? 'Week not set' : 'Week $week';
}

String _lessonStatus(dynamic lesson) {
  final value = lesson is Map ? lesson['is_published'] == true : false;
  return value ? 'Published' : 'Draft';
}

String _postType(dynamic post) {
  final value = post is Map ? post['post_type']?.toString() ?? post['type']?.toString() ?? 'post' : 'post';
  return value.replaceAll('_', ' ').toUpperCase();
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
