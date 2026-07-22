import 'package:flutter/foundation.dart';
import 'package:parent_app/core/api/api_client.dart';

/// Loads the data needed for the role-specific dashboards (teacher, student, trainer).
class DashboardProvider with ChangeNotifier {
  final ApiClient apiClient;

  bool _isLoading = false;
  String? _error;
  Map<String, dynamic> _data = {};

  DashboardProvider({required this.apiClient});

  bool get isLoading => _isLoading;
  String? get error => _error;
  Map<String, dynamic> get data => _data;

  Future<void> fetchDashboard(String role) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      if (role == 'STUDENT') {
        final attendance = await _getList('/attendance/attendance-records/');
        final assessments = await _getList('/assessment/assessments/');
        final reports = await _getList('/exams/report-cards/');
        final courses = await _getList('/courses/courses/');
        _data = {
          'attendance': attendance,
          'assessments': assessments,
          'reports': reports,
          'courses': courses,
        };
      } else if (role == 'TEACHER' || role == 'STAFF') {
        final assignments = await _getList('/academics/teacher-assignments/');
        final assessments = await _getList('/assessment/assessments/');
        final schemes = await _getList('/curriculum/schemes/');
        final courses = await _getList('/courses/courses/');
        _data = {
          'assignments': assignments,
          'assessments': assessments,
          'schemes': schemes,
          'courses': courses,
        };
      } else {
        final announcements = await _getList('/messaging/announcements/');
        final orders = await _getList('/shop/orders/my_orders/');
        final requiredItems = await _getList('/requirements/public/');
        final teachers = await _getList('/academics/teacher-assignments/my_teachers/');
        _data = {
          'announcements': announcements,
          'orders': orders,
          'required_items': requiredItems,
          'teachers': teachers,
        };
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<List<dynamic>> _getList(String path) async {
    final response = await apiClient.dio.get(path);
    if (response.data is List) return response.data as List<dynamic>;
    return (response.data['results'] as List?) ?? [];
  }
}
