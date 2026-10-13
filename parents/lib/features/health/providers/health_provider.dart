import 'package:flutter/foundation.dart';
import '../../../core/api/api_client.dart';

class HealthProvider with ChangeNotifier {
  final ApiClient apiClient;

  bool _isLoading = false;
  String? _error;

  Map<String, dynamic>? _healthRecord;
  List<dynamic> _nurseVisits = [];
  List<dynamic> _children = [];
  int? _selectedChildId;
  String? _selectedChildName;

  HealthProvider({required this.apiClient});

  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasError => _error != null;
  Map<String, dynamic>? get healthRecord => _healthRecord;
  List<dynamic> get nurseVisits => _nurseVisits;
  List<dynamic> get children => _children;
  int? get selectedChildId => _selectedChildId;
  String? get selectedChildName => _selectedChildName;

  Future<void> fetchChildren() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final response = await apiClient.dio.get('/auth/parent-learner-links/');
      final raw = response.data;
      final links = raw is List ? raw : (raw['results'] ?? []);
      _children = links;
      if (_children.isNotEmpty && _selectedChildId == null) {
        final first = _children.first;
        _selectedChildId = first['learner'] is Map ? first['learner']['id'] as int? : first['learner'] as int?;
        _selectedChildName = '${first['learner'] is Map ? (first['learner'] as Map)['first_name'] : ''}'
            '${first['learner'] is Map ? (first['learner'] as Map)['last_name'] : ''}';
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error fetching children: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }

    if (_selectedChildId != null) {
      await fetchHealthRecord(_selectedChildId!);
    }
  }

  void selectChild(int childId, String childName) {
    _selectedChildId = childId;
    _selectedChildName = childName;
    _healthRecord = null;
    _nurseVisits = [];
    notifyListeners();
    fetchHealthRecord(childId);
  }

  Future<void> fetchHealthRecord(int studentId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final response = await apiClient.dio.get(
        '/health/records/',
        queryParameters: {'student': studentId},
      );
      final raw = response.data;
      final results = raw is List ? raw : (raw['results'] ?? []);
      if (results.isNotEmpty) {
        _healthRecord = results.first as Map<String, dynamic>;
        _nurseVisits = List<dynamic>.from((_healthRecord?['visits'] ?? []));
      } else {
        _healthRecord = null;
        _nurseVisits = [];
        await fetchNurseVisits(studentId);
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error fetching health record: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchNurseVisits(int studentId) async {
    try {
      final response = await apiClient.dio.get(
        '/health/visits/',
        queryParameters: {'student': studentId},
      );
      final raw = response.data;
      _nurseVisits = List<dynamic>.from(raw is List ? raw : (raw['results'] ?? []));
    } catch (e) {
      debugPrint('Error fetching nurse visits: $e');
    }
    notifyListeners();
  }
}
