import 'package:flutter/foundation.dart';
import '../../../core/api/api_client.dart';

class PayrollProvider with ChangeNotifier {
  final ApiClient apiClient;

  bool _isLoading = false;
  String? _error;
  List<dynamic> _payslips = [];
  List<dynamic> _leaveRequests = [];
  List<dynamic> _leaveTypes = [];
  Map<String, dynamic>? _settings;
  Map<String, dynamic>? _staffProfile;

  PayrollProvider({required this.apiClient});

  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasError => _error != null;
  List<dynamic> get payslips => _payslips;
  List<dynamic> get leaveRequests => _leaveRequests;
  List<dynamic> get leaveTypes => _leaveTypes;
  Map<String, dynamic>? get settings => _settings;
  Map<String, dynamic>? get staffProfile => _staffProfile;

  Future<void> fetchAll() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final payslipsRes = await apiClient.dio.get('/payroll/payslips/');
      final payRaw = payslipsRes.data;
      _payslips = List<dynamic>.from(payRaw is List ? payRaw : (payRaw['results'] ?? []));

      final leavesRes = await apiClient.dio.get('/payroll/leave-requests/');
      final leaveRaw = leavesRes.data;
      _leaveRequests = List<dynamic>.from(leaveRaw is List ? leaveRaw : (leaveRaw['results'] ?? []));

      final typesRes = await apiClient.dio.get('/payroll/leave-types/');
      final typesRaw = typesRes.data;
      _leaveTypes = List<dynamic>.from(typesRaw is List ? typesRaw : (typesRaw['results'] ?? []));

      final settingsRes = await apiClient.dio.get('/payroll/settings/');
      final setRaw = settingsRes.data;
      final setList = setRaw is List ? setRaw : (setRaw['results'] ?? []);
      _settings = setList.isNotEmpty ? (setList.first as Map<String, dynamic>) : null;

      final profileRes = await apiClient.dio.get('/payroll/staff-profiles/');
      final profRaw = profileRes.data;
      final profList = profRaw is List ? profRaw : (profRaw['results'] ?? []);
      if (profList.isNotEmpty) {
        _staffProfile = profList.first as Map<String, dynamic>;
      } else {
        _staffProfile = null;
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error fetching payroll data: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> submitLeaveRequest({
    required int staff,
    required int leaveType,
    required String startDate,
    required String endDate,
    required int days,
    required String reason,
  }) async {
    _error = null;
    try {
      await apiClient.dio.post('/payroll/leave-requests/', data: {
        'staff': staff,
        'leave_type': leaveType,
        'start_date': startDate,
        'end_date': endDate,
        'days': days,
        'reason': reason,
      });
      await fetchAll();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    await fetchAll();
  }

  int? get staffProfileId => _staffProfile?['id'] as int?;
}
