import 'package:flutter/foundation.dart';
import 'package:parent_app/core/api/api_client.dart';

class CourseProvider with ChangeNotifier {
  final ApiClient apiClient;

  List<dynamic> _courses = [];
  Map<String, dynamic>? _activeCourse;
  List<dynamic> _topics = [];
  List<dynamic> _assignments = [];
  List<dynamic> _posts = [];
  Map<String, dynamic>? _activeTopic;
  Map<int, bool> _progress = {};
  Map<int, dynamic> _progressDetail = {};
  bool _isLoading = false;
  bool _isLoadingDetail = false;
  bool _isLoadingTopic = false;
  String? _error;

  CourseProvider({required this.apiClient});

  List<dynamic> _asList(dynamic data) {
    if (data is List) return data;
    if (data is Map<String, dynamic>) {
      final results = data['results'];
      if (results is List) return results;
    }
    return [];
  }

  List<dynamic> get courses => _courses;
  Map<String, dynamic>? get activeCourse => _activeCourse;
  List<dynamic> get topics => _topics;
  List<dynamic> get assignments => _assignments;
  List<dynamic> get posts => _posts;
  Map<String, dynamic>? get activeTopic => _activeTopic;
  bool get isLoading => _isLoading;
  bool get isLoadingDetail => _isLoadingDetail;
  bool get isLoadingTopic => _isLoadingTopic;
  Map<int, dynamic> get progress => _progressDetail;
  String? get error => _error;

  Map<String, dynamic> _asMap(dynamic data) {
    if (data is Map<String, dynamic>) return data;
    if (data is Map) return Map<String, dynamic>.from(data);
    return <String, dynamic>{};
  }

  int? _toInt(dynamic value) {
    if (value is int) return value;
    if (value is String) return int.tryParse(value);
    return null;
  }

  Future<void> fetchCourses() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final response = await apiClient.dio.get('/courses/courses/');
      _courses = _asList(response.data);
    } catch (e) {
      _error = e.toString();
      _courses = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> openCourse(int id) async {
    _isLoadingDetail = true;
    _error = null;
    _activeCourse = null;
    _topics = [];
    _assignments = [];
    _posts = [];
    notifyListeners();
    try {
      final courseRes = await apiClient.dio.get('/courses/courses/$id/');
      final data = _asMap(courseRes.data);
      final lessons = (data['lessons'] as List<dynamic>? ?? []);
      for (final l in lessons) {
        final lid = _toInt(l['id']);
        if (lid != null) {
          try {
            final ri = await apiClient.dio.get('/courses/lessons/$lid/required_items/');
            l['required_items'] = ri.data;
          } catch (_) {
            l['required_items'] = [];
          }
        }
      }
      _activeCourse = data;

      final topicsRes = await apiClient.dio.get('/courses/courses/$id/topics/');
      _topics = _asList(topicsRes.data);

      final assignRes = await apiClient.dio.get('/courses/courses/$id/assignments/');
      _assignments = _asList(assignRes.data);

      final postsRes = await apiClient.dio.get('/courses/courses/$id/posts/');
      _posts = _asList(postsRes.data);

      await _loadProgress();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoadingDetail = false;
      notifyListeners();
    }
  }

  Future<void> openTopic(int topicId) async {
    _isLoadingTopic = true;
    _error = null;
    _activeTopic = null;
    notifyListeners();
    try {
      final topicRes = await apiClient.dio.get('/courses/topics/$topicId/');
      _activeTopic = _asMap(topicRes.data);

      final courseId = _toInt(_activeTopic?['course']);
      if (courseId != null) {
        try {
          final courseRes = await apiClient.dio.get('/courses/courses/$courseId/');
          _activeCourse = _asMap(courseRes.data);
        } catch (_) {}
      }

      final subStrandId = _toInt(_activeTopic?['sub_strand']);
      if (subStrandId != null) {
        try {
          final subRes = await apiClient.dio.get('/academics/sub-strands/$subStrandId/');
          _activeTopic = {...?_activeTopic, 'sub_strand_detail': subRes.data};
        } catch (_) {}
      }

      final lessonsRes = await apiClient.dio.get('/courses/lessons/?topic=$topicId');
      final lessons = _asList(lessonsRes.data);
      _activeTopic = {...?_activeTopic, 'lessons': lessons};

      final assignRes = await apiClient.dio.get('/courses/assignments/?topic=$topicId');
      final assignments = _asList(assignRes.data);
      _activeTopic = {...?_activeTopic, 'assignments': assignments};

      final postsRes = await apiClient.dio.get('/courses/posts/?topic=$topicId');
      final posts = _asList(postsRes.data);
      final postIds = posts.map((p) => _toInt(p['id'])).whereType<int>().toList();
      final commentsFutures = postIds.map((pid) =>
          apiClient.dio.get('/courses/post-comments/?post=$pid').then((r) => _asList(r.data)).catchError((_) => <dynamic>[]));
      final commentsResults = await Future.wait(commentsFutures);
      final allComments = <dynamic>[];
      for (final r in commentsResults) {
        allComments.addAll(r);
      }
      _activeTopic = {...?_activeTopic, 'posts': posts, 'comments': allComments};
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoadingTopic = false;
      notifyListeners();
    }
  }

  Future<void> _loadProgress() async {
    final lessons =
        (_activeCourse?['lessons'] as List<dynamic>? ?? []);
    final ids = lessons.map((l) => l['id']).whereType<int>().join(',');
    if (ids.isEmpty) return;
    try {
      final response = await apiClient.dio
          .get('/courses/lesson-progress/?lesson__in=$ids');
      final rows = _asList(response.data);
      final map = <int, bool>{};
      final detail = <int, dynamic>{};
      for (final p in rows) {
        final lessonId = p['lesson'];
        if (lessonId is int) {
          map[lessonId] = p['is_completed'] == true;
          detail[lessonId] = {'is_completed': p['is_completed'], 'score': p['score']};
        }
      }
      _progress = map;
      _progressDetail = detail;
    } catch (_) {
      _progress = {};
    }
  }

  bool isCompleted(int lessonId) => _progress[lessonId] == true;

  Future<void> completeLesson(int lessonId) async {
    try {
      await apiClient.dio.post('/courses/lesson-progress/self_paced_complete/',
          data: {'lesson_id': lessonId});
      _progress[lessonId] = true;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> submitAssignment(int assignmentId, {String? answer}) async {
    try {
      await apiClient.dio.post('/courses/submissions/', data: {
        'assignment': assignmentId,
        if (answer != null) 'answer': answer,
      });
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> postComment(int postId, String message) async {
    try {
      await apiClient.dio.post('/courses/post-comments/', data: {
        'post': postId,
        'message': message,
      });
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }
}
