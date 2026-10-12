import 'package:flutter/foundation.dart';
import '../../../core/api/api_client.dart';

class AlumniProvider with ChangeNotifier {
  final ApiClient apiClient;

  bool _isLoading = false;
  String? _error;
  List<dynamic> _events = [];
  String? _searchQuery;

  AlumniProvider({required this.apiClient});

  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasError => _error != null;
  List<dynamic> get events => _events;
  List<dynamic> get filteredEvents {
    if (_searchQuery == null || _searchQuery!.trim().isEmpty) return _events;
    final q = _searchQuery!.toLowerCase();
    return _events.where((e) {
      final title = (e['title'] as String?)?.toLowerCase() ?? '';
      final desc = (e['description'] as String?)?.toLowerCase() ?? '';
      final location = (e['location'] as String?)?.toLowerCase() ?? '';
      return title.contains(q) || desc.contains(q) || location.contains(q);
    }).toList();
  }

  Future<void> fetchEvents() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final response = await apiClient.dio.get('/alumni/events/');
      final raw = response.data;
      _events = List<dynamic>.from(raw is List ? raw : (raw['results'] ?? []));
    } catch (e) {
      _error = e.toString();
      debugPrint('Error fetching alumni events: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  Future<void> refresh() async {
    await fetchEvents();
  }
}
