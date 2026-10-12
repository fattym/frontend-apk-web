import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/payroll_provider.dart';
import '../../../core/theme/theme_tokens.dart';

class PayslipsPage extends StatefulWidget {
  const PayslipsPage({super.key});

  @override
  State<PayslipsPage> createState() => _PayslipsPageState();
}

class _PayslipsPageState extends State<PayslipsPage> {
  final _reasonController = TextEditingController();
  String? _selectedLeaveType;
  String _startDate = DateTime.now().toIso8601String().split('T').first;
  String _endDate = DateTime.now().toIso8601String().split('T').first;
  int _days = 1;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      final provider = context.read<PayrollProvider>();
      if (provider.payslips.isEmpty) {
        provider.fetchAll();
      }
    });
  }

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  void _onStartDateChanged(String v) {
    setState(() {
      _startDate = v;
      _calculateDays();
    });
  }

  void _onEndDateChanged(String v) {
    setState(() {
      _endDate = v;
      _calculateDays();
    });
  }

  void _calculateDays() {
    final start = DateTime.parse(_startDate);
    final end = DateTime.parse(_endDate);
    _days = end.difference(start).inDays + 1;
  }

  Future<void> _submitLeaveRequest() async {
    final provider = context.read<PayrollProvider>();
    final staffId = provider.staffProfileId;
    if (_selectedLeaveType == null || staffId == null) return;

    final typeId = int.tryParse(_selectedLeaveType!) ?? 0;
    final reason = _reasonController.text.trim();
    if (reason.isEmpty) return;

    await provider.submitLeaveRequest(
      staff: staffId,
      leaveType: typeId,
      startDate: _startDate,
      endDate: _endDate,
      days: _days,
      reason: reason,
    );
    _reasonController.clear();
    setState(() {
      _selectedLeaveType = null;
      _days = 1;
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PayrollProvider>();
    final payslips = provider.payslips;
    final leaveRequests = provider.leaveRequests;
    final leaveTypes = provider.leaveTypes;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Payroll'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        bottom: const TabBar(
          indicatorColor: kAccent,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: [
            Tab(text: 'Payslips'),
            Tab(text: 'Leave Requests'),
            Tab(text: 'Request Leave'),
          ],
        ),
      ),
      body: provider.isLoading && payslips.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : provider.hasError
              ? Center(child: Text('Error: ${provider.error}', style: TextStyle(color: kDanger)))
              : TabBarView(
                  children: [
                    _PayslipsList(payslips, provider),
                    _LeaveRequestsList(leaveRequests, provider),
                    _RequestLeaveForm(
                      leaveTypes: leaveTypes,
                      reasonController: _reasonController,
                      selectedLeaveType: _selectedLeaveType,
                      startDate: _startDate,
                      endDate: _endDate,
                      days: _days,
                      onLeaveTypeChanged: (v) => setState(() => _selectedLeaveType = v),
                      onStartDateChanged: _onStartDateChanged,
                      onEndDateChanged: _onEndDateChanged,
                      onSubmit: _submitLeaveRequest,
                     ),
                  ],
                ),
              );
    }
  }

class _PayslipsList extends StatelessWidget {
  final List<dynamic> payslips;
  final PayrollProvider provider;

  const _PayslipsList(this.payslips, this.provider);

  @override
  Widget build(BuildContext context) {
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return RefreshIndicator(
      onRefresh: provider.refresh,
      child: payslips.isEmpty
          ? const Center(child: Text('No payslips found.'))
          : ListView.builder(
              padding: const EdgeInsets.all(kSpacing16),
              itemCount: payslips.length,
              itemBuilder: (context, index) {
                final p = payslips[index] as Map<String, dynamic>;
                final month = p['month'] as int? ?? 1;
                final year = p['year'] as int? ?? DateTime.now().year;
                final netSalary = p['net_salary'] ?? '0';
                final isPaid = p['is_paid'] == true;

                return Card(
                  margin: const EdgeInsets.only(bottom: kSpacing8),
                  child: ListTile(
                    leading: const Icon(Icons.receipt_long, color: kAccent),
                    title: Text('${months[month - 1]} $year',
                        style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('Net: KES $netSalary'),
                    trailing: Chip(
                      label: Text(isPaid ? 'Paid' : 'Pending',
                          style: const TextStyle(fontSize: 11, color: Colors.white)),
                      backgroundColor: isPaid ? kSuccess : kWarning,
                      visualDensity: VisualDensity.compact,
                    ),
                  ),
                );
              },
            ),
    );
  }
}

class _LeaveRequestsList extends StatelessWidget {
  final List<dynamic> requests;
  final PayrollProvider provider;

  const _LeaveRequestsList(this.requests, this.provider);

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: provider.refresh,
      child: requests.isEmpty
          ? const Center(child: Text('No leave requests found.'))
          : ListView.builder(
              padding: const EdgeInsets.all(kSpacing16),
              itemCount: requests.length,
              itemBuilder: (context, index) {
                final r = requests[index] as Map<String, dynamic>;
                final status = r['status'] as String? ?? 'PENDING';
                final statusColor = switch (status) {
                  'APPROVED' => kSuccess,
                  'REJECTED' => kDanger,
                  'CANCELLED' => kGray600,
                  _ => kWarning,
                };

                String formatDate(String? dateStr) {
                  if (dateStr == null) return '?';
                  try {
                    return DateTime.parse(dateStr).toLocal().toIso8601String().split('T').first;
                  } catch (_) {
                    return dateStr;
                  }
                }

                return Card(
                  margin: const EdgeInsets.only(bottom: kSpacing8),
                  child: Padding(
                    padding: const EdgeInsets.all(kSpacing12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(r['leave_type_name'] as String? ??
                            (r['leave_type'] is Map
                                ? (r['leave_type'] as Map)['name'] ?? ''
                                : r['leave_type']?.toString() ?? 'Leave Request'),
                            style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 4),
                        Text('${formatDate(r['start_date'])} – ${formatDate(r['end_date'])}',
                            style: TextStyle(color: Colors.grey[600])),
                        Text('${r['days']} days', style: TextStyle(color: Colors.grey[600])),
                        const SizedBox(height: kSpacing4),
                        Text(r['reason'] as String? ?? '', style: Theme.of(context).textTheme.bodySmall),
                        const SizedBox(height: kSpacing4),
                        Align(
                          alignment: Alignment.centerRight,
                          child: Chip(
                            label: Text(status, style: const TextStyle(fontSize: 11, color: Colors.white)),
                            backgroundColor: statusColor,
                            visualDensity: VisualDensity.compact,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}

class _RequestLeaveForm extends StatelessWidget {
  final List<dynamic> leaveTypes;
  final TextEditingController reasonController;
  final String? selectedLeaveType;
  final String startDate;
  final String endDate;
  final int days;
  final ValueChanged<String?> onLeaveTypeChanged;
  final ValueChanged<String> onStartDateChanged;
  final ValueChanged<String> onEndDateChanged;
  final VoidCallback onSubmit;

  const _RequestLeaveForm({
    required this.leaveTypes,
    required this.reasonController,
    required this.selectedLeaveType,
    required this.startDate,
    required this.endDate,
    required this.days,
    required this.onLeaveTypeChanged,
    required this.onStartDateChanged,
    required this.onEndDateChanged,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(kSpacing16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Request Leave', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: kSpacing12),
          DropdownButtonFormField<String>(
            value: selectedLeaveType,
            decoration: const InputDecoration(border: OutlineInputBorder(), labelText: 'Leave Type'),
            items: leaveTypes.map<DropdownMenuItem<String>>((t) {
              final name = t['name'] as String? ?? t['id']?.toString() ?? '';
              final isPaid = t['is_paid'] == true;
              return DropdownMenuItem<String>(
                value: t['id']?.toString(),
                child: Text('$name ${isPaid ? '(Paid)' : '(Unpaid)'}'),
              );
            }).toList(),
            onChanged: onLeaveTypeChanged,
          ),
          const SizedBox(height: kSpacing12),
          TextFormField(
            decoration: InputDecoration(
              border: const OutlineInputBorder(),
              labelText: 'Start Date',
              suffixIcon: const Icon(Icons.calendar_today, size: 20),
            ),
            onTap: () async {
              FocusScope.of(context).requestFocus(FocusNode());
              final picked = await showDatePicker(
                context: context,
                initialDate: DateTime.parse(startDate),
                firstDate: DateTime.now(),
                lastDate: DateTime.now().add(const Duration(days: 365)),
              );
              if (picked != null) onStartDateChanged(picked.toIso8601String().split('T').first);
            },
            readOnly: true,
            controller: TextEditingController(text: startDate),
          ),
          const SizedBox(height: kSpacing12),
          TextFormField(
            decoration: InputDecoration(
              border: const OutlineInputBorder(),
              labelText: 'End Date',
              suffixIcon: const Icon(Icons.calendar_today, size: 20),
            ),
            onTap: () async {
              FocusScope.of(context).requestFocus(FocusNode());
              final picked = await showDatePicker(
                context: context,
                initialDate: DateTime.parse(endDate),
                firstDate: DateTime.now(),
                lastDate: DateTime.now().add(const Duration(days: 365)),
              );
              if (picked != null) onEndDateChanged(picked.toIso8601String().split('T').first);
            },
            readOnly: true,
            controller: TextEditingController(text: endDate),
          ),
          const SizedBox(height: kSpacing12),
          Text('Days: $days', style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: kSpacing12),
          TextFormField(
            controller: reasonController,
            decoration: const InputDecoration(border: OutlineInputBorder(), labelText: 'Reason'),
            maxLines: 3,
          ),
          const SizedBox(height: kSpacing20),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: onSubmit,
              icon: const Icon(Icons.send),
              label: const Text('Submit Request'),
            ),
          ),
        ],
      ),
    );
  }
}
