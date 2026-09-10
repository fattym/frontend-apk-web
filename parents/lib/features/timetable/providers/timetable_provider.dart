import 'package:flutter/foundation.dart';
import 'package:parent_app/core/api/api_client.dart';

class TimetableProvider with ChangeNotifier {
  final ApiClient apiClient;
  List<dynamic> _slots = [];
  Map<String, dynamic>? _config;
  bool _isLoading = false;

  TimetableProvider({required this.apiClient});

  List<dynamic> get slots => _slots;
  Map<String, dynamic>? get config => _config;
  bool get isLoading => _isLoading;

  Future<void> fetchSlots() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await apiClient.dio.get('/academics/timetable-slot/');
      _slots = response.data is List ? response.data : response.data['results'] ?? [];
    } catch (e) {
      debugPrint('Error fetching timetable slots: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchConfig() async {
    try {
      final response = await apiClient.dio.get('/academics/timetable-config/');
      final configs = response.data is List ? response.data : response.data['results'] ?? [];
      if (configs.isNotEmpty) {
        _config = configs.first;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching timetable config: $e');
    }
  }

  Future<bool> generateTimetable() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await apiClient.dio.post('/academics/timetable/generate/');
      if (response.statusCode == 200) {
        await fetchSlots();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error generating timetable: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  List<dynamic> getSlotsForStudent(int studentId) {
    // For parent app, filter slots by student's class
    // This would need the student's class info from the auth provider
    return _slots;
  }
}