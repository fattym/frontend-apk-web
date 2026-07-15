import 'package:flutter/foundation.dart';
import 'package:parent_app/core/api/api_client.dart';

class RequirementsProvider with ChangeNotifier {
  final ApiClient apiClient;
  List<dynamic> _requiredItems = [];
  bool _isLoading = false;

  RequirementsProvider({required this.apiClient});

  List<dynamic> get requiredItems => _requiredItems;
  bool get isLoading => _isLoading;

  Future<void> fetchRequiredItems() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await apiClient.dio.get('/requirements/public/');
      _requiredItems = response.data is List ? response.data : response.data['results'] ?? [];
    } catch (e) {
      debugPrint('Error fetching required items: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
