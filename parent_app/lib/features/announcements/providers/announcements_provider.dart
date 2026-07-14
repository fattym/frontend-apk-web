import 'package:flutter/foundation.dart';
import 'package:parent_app/core/api/api_client.dart';

class AnnouncementsProvider with ChangeNotifier {
  final ApiClient apiClient;
  List<dynamic> _announcements = [];
  bool _isLoading = false;

  AnnouncementsProvider({required this.apiClient});

  List<dynamic> get announcements => _announcements;
  bool get isLoading => _isLoading;

  Future<void> fetchAnnouncements() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await apiClient.dio.get('/messaging/announcements/');
      _announcements = response.data is List ? response.data : response.data['results'] ?? [];
    } catch (e) {
      debugPrint('Error fetching announcements: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
