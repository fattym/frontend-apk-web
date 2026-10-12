import 'package:flutter/foundation.dart';
import '../../../core/api/api_client.dart';

class DisciplineProvider with ChangeNotifier {
  final ApiClient apiClient;

  bool _isLoading = false;
  String? _error;

  List<dynamic> _records = [];
  List<dynamic> _children = [];
  int? _selectedChildId;
  String? _selectedChildName;

  DisciplineProvider({required this.apiClient});

  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasError => _error != null;
  List<dynamic> get records => _records;
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
      _children = raw is List ? raw : (raw['results'] ?? []);
      if (_children.isNotEmpty && _selectedChildId == null) {
        final first = _children.first;
        _selectedChildId = first['learner'] is Map ? (first['learner'] as Map)['id'] as int? : first['learner'] as int?;
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
      await fetchRecords(_selectedChildId!);
    }
  }

  void selectChild(int childId, String childName) {
    _selectedChildId = childId;
    _selectedChildName = childName;
    _records = [];
    notifyListeners();
    fetchRecords(childId);
  }

  Future<void> fetchRecords(int studentId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final response = await apiClient.dio.get(
        '/discipline/records/',
        queryParameters: {'student': studentId},
      );
      final raw = response.data;
      _records = List<dynamic>.from(raw is List ? raw : (raw['results'] ?? []));
    } catch (e) {
      _error = e.toString();
      debugPrint('Error fetching discipline records: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
