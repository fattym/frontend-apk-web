import 'package:flutter/foundation.dart';
import 'package:parent_app/core/api/api_client.dart';

class ExamResultsProvider with ChangeNotifier {
  final ApiClient apiClient;
  List<dynamic> _results = [];
  Map<String, dynamic>? _summary;
  List<dynamic> _toppers = [];
  bool _isLoading = false;

  ExamResultsProvider({required this.apiClient});

  List<dynamic> get results => _results;
  Map<String, dynamic>? get summary => _summary;
  List<dynamic> get toppers => _toppers;
  bool get isLoading => _isLoading;

  Future<void> fetchExamResults(int examId) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await apiClient.dio.get('/exams/exams/$examId/result-summary/');
      _summary = response.data;
      _results = response.data['top_students'] ?? [];
    } catch (e) {
      debugPrint('Error fetching exam results: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchToppers() async {
    try {
      final response = await apiClient.dio.get('/exams/exams/toppers/');
      _toppers = response.data['toppers'] ?? [];
      notifyListeners();
    } catch (e) {
      debugPrint('Error fetching toppers: $e');
    }
  }

  Future<void> fetchAllResults() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await apiClient.dio.get('/exams/exams/');
      final exams = response.data['exams'] ?? response.data['results'] ?? [];
      if (exams.isNotEmpty) {
        // Fetch results for the most recent exam
        await fetchExamResults(exams.first['id']);
      }
    } catch (e) {
      debugPrint('Error fetching all results: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}