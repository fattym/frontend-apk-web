import 'package:flutter/foundation.dart';
import '../../../core/api/api_client.dart';

class PtmProvider with ChangeNotifier {
  final ApiClient apiClient;

  bool _isLoading = false;
  String? _error;
  List<dynamic> _meetings = [];
  String? _selectedStatus;

  PtmProvider({required this.apiClient});

  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasError => _error != null;
  List<dynamic> get meetings => _meetings;

  List<dynamic> get filteredMeetings {
    if (_selectedStatus == null) return _meetings;
    return _meetings.where((m) => m['status'] == _selectedStatus).toList();
  }

  Future<void> fetchMeetings() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final response = await apiClient.dio.get('/parent-meetings/meetings/');
      final raw = response.data;
      _meetings = List<dynamic>.from(raw is List ? raw : (raw['results'] ?? []));
    } catch (e) {
      _error = e.toString();
      debugPrint('Error fetching meetings: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void filterByStatus(String? status) {
    _selectedStatus = status;
    notifyListeners();
  }

  Future<void> confirmMeeting(int meetingId) async {
    _error = null;
    try {
      await apiClient.dio.patch(
        '/parent-meetings/meetings/$meetingId/',
        data: {'status': 'CONFIRMED'},
      );
      await fetchMeetings();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> addNote(int meetingId, String content) async {
    _error = null;
    try {
      await apiClient.dio.post('/parent-meetings/notes/', data: {
        'meeting': meetingId,
        'content': content,
      });
      await fetchMeetings();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    await fetchMeetings();
  }
}
