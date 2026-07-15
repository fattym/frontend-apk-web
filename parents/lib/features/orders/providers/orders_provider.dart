import 'package:flutter/foundation.dart';
import 'package:parent_app/core/api/api_client.dart';

class OrdersProvider with ChangeNotifier {
  final ApiClient apiClient;
  List<dynamic> _orders = [];
  bool _isLoading = false;

  OrdersProvider({required this.apiClient});

  List<dynamic> get orders => _orders;
  bool get isLoading => _isLoading;

  Future<void> fetchMyOrders() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await apiClient.dio.get('/shop/orders/my_orders/');
      _orders = response.data is List ? response.data : response.data['results'] ?? [];
    } catch (e) {
      debugPrint('Error fetching orders: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
