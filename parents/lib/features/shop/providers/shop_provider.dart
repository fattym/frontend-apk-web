import 'package:flutter/foundation.dart';
import 'package:parent_app/core/api/api_client.dart';

class ShopProvider with ChangeNotifier {
  final ApiClient apiClient;
  List<dynamic> _products = [];
  List<dynamic> _categories = [];
  bool _isLoading = false;

  ShopProvider({required this.apiClient});

  List<dynamic> get products => _products;
  List<dynamic> get categories => _categories;
  bool get isLoading => _isLoading;

  Future<void> fetchProducts() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await apiClient.dio.get('/shop/products/');
      _products = response.data is List ? response.data : response.data['results'] ?? [];
    } catch (e) {
      debugPrint('Error fetching products: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchCategories() async {
    try {
      final response = await apiClient.dio.get('/shop/categories/');
      _categories = response.data is List ? response.data : response.data['results'] ?? [];
      notifyListeners();
    } catch (e) {
      debugPrint('Error fetching categories: $e');
    }
  }
}
