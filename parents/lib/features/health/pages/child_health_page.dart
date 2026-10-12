import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/health_provider.dart';
import '../../../core/theme/theme_tokens.dart';

class ChildHealthPage extends StatefulWidget {
  const ChildHealthPage({super.key});

  @override
  State<ChildHealthPage> createState() => _ChildHealthPageState();
}

class _ChildHealthPageState extends State<ChildHealthPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      final provider = context.read<HealthProvider>();
      if (provider.children.isEmpty) {
        provider.fetchChildren();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<HealthProvider>();
    final children = provider.children;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Health Records'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          if (provider.hasError)
            IconButton(
              icon: const Icon(Icons.error, color: kDanger),
              onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(provider.error!)),
              ),
            ),
        ],
      ),
      body: provider.isLoading && children.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : (children.isEmpty
              ? const Center(child: Text('No children found.'))
              : _buildChildSelector(provider, children)),
    );
  }

  Widget _buildChildSelector(HealthProvider provider, List<dynamic> children) {
    final selectedId = provider.selectedChildId;

    String childLabel(dynamic link) {
      final learner = link['learner'] is Map ? link['learner'] as Map : null;
      if (learner != null) {
        return '${learner['first_name']} ${learner['last_name']}';
      }
      final id = link['learner'] is int ? link['learner'] : null;
      return 'Child #$id';
    }

    return RefreshIndicator(
      onRefresh: () => provider.fetchChildren(),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(kSpacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Select a child', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: kSpacing8),
            DropdownButtonFormField<int>(
              value: selectedId,
              decoration: InputDecoration(
                border: const OutlineInputBorder(),
                hintText: 'Choose child',
              ),
              items: children.map<DropdownMenuItem<int>>((link) {
                final learner = link['learner'] is Map ? link['learner'] as Map : null;
                final id = learner != null ? learner['id'] as int? : (link['learner'] is int ? link['learner'] as int : null);
                final relationship = link['relationship'] as String? ?? '';
                return DropdownMenuItem<int>(
                  value: id,
                  child: Text('${childLabel(link)}${relationship.isNotEmpty ? ' ($relationship)' : ''}'),
                );
              }).toList(),
              onChanged: (int? value) {
                if (value != null) {
                  final link = children.firstWhere((c) {
                    final learner = c['learner'] is Map ? c['learner'] as Map : null;
                    final id = learner != null ? learner['id'] : (c['learner'] is int ? c['learner'] : null);
                    return id == value;
                  });
                  final name = childLabel(link);
                  provider.selectChild(value, name);
                }
              },
            ),
            const SizedBox(height: kSpacing16),
            _buildContent(provider, provider.healthRecord, provider.nurseVisits),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(HealthProvider provider, Map<String, dynamic>? record, List<dynamic> visits) {
    if (provider.isLoading) {
      return const Center(child: Padding(
        padding: EdgeInsets.all(kSpacing32),
        child: CircularProgressIndicator(),
      ));
    }
    if (provider.hasError) {
      return Center(child: Text('Error: ${provider.error}', style: const TextStyle(color: kDanger)));
    }

    return RefreshIndicator(
      onRefresh: () {
        if (provider.selectedChildId != null) {
          return provider.fetchHealthRecord(provider.selectedChildId!);
        }
        return Future.value();
      },
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(kSpacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (record != null) ...[
              _buildRecordCard(record),
            ] else ...[
              const Text('No health record on file for this child.'),
            ],
            const SizedBox(height: kSpacing16),
            Text('Nurse Visits', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: kSpacing8),
            if (visits.isEmpty)
              const Text('No nurse visits recorded.')
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: visits.length,
                itemBuilder: (context, index) {
                  final v = visits[index] as Map<String, dynamic>;
                  final severity = v['severity'] as String? ?? '';
                  final severityColor = switch (severity) {
                    'SERIOUS' => kDanger,
                    'MODERATE' => kWarning,
                    _ => kSuccess,
                  };
                  return Card(
                    margin: const EdgeInsets.only(bottom: kSpacing8),
                    child: ListTile(
                      leading: CircleAvatar(backgroundColor: severityColor.withValues(alpha: 0.1), foregroundColor: severityColor, child: const Icon(Icons.medical_services)),
                      title: Text(v['reason'] as String? ?? 'Visit'),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (v['treatment'] != null && (v['treatment'] as String).isNotEmpty)
                            Text('Treatment: ${v['treatment']}'),
                          if (v['medication_given'] != null && (v['medication_given'] as String).isNotEmpty)
                            Text('Medication: ${v['medication_given']}'),
                          Text('${v['parent_notified'] == true ? 'Parent notified' : 'Parent not notified'}',
                              style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                        ],
                      ),
                      isThreeLine: true,
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecordCard(Map<String, dynamic> record) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(kSpacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Health Record Details', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: kSpacing8),
            if (record['allergies'] != null && (record['allergies'] as String).isNotEmpty)
              _buildRow('Allergies', record['allergies']),
            if (record['medications'] != null && (record['medications'] as String).isNotEmpty)
              _buildRow('Medications', record['medications']),
            if (record['medical_conditions'] != null && (record['medical_conditions'] as String).isNotEmpty)
              _buildRow('Medical Conditions', record['medical_conditions']),
            _buildRow('Emergency Contact', '${record['emergency_contact_name']} — ${record['emergency_contact_phone']}'),
            if (record['last_updated'] != null)
              _buildRow('Last Updated', record['last_updated']),
          ],
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value) => Padding(
        padding: const EdgeInsets.symmetric(vertical: kSpacing4),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(width: 130, child: Text('$label:', style: const TextStyle(fontWeight: FontWeight.w600))),
            Expanded(child: Text(value)),
          ],
        ),
      );
}
