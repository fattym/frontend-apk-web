import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/discipline_provider.dart';
import '../../../core/theme/theme_tokens.dart';

class ChildDisciplinePage extends StatefulWidget {
  const ChildDisciplinePage({super.key});

  @override
  State<ChildDisciplinePage> createState() => _ChildDisciplinePageState();
}

class _ChildDisciplinePageState extends State<ChildDisciplinePage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      final provider = context.read<DisciplineProvider>();
      if (provider.children.isEmpty) {
        provider.fetchChildren();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DisciplineProvider>();
    final children = provider.children;
    final records = provider.records;
    final selectedId = provider.selectedChildId;

    String childLabel(dynamic link) {
      final learner = link['learner'] is Map ? link['learner'] as Map : null;
      if (learner != null) {
        return '${learner['first_name']} ${learner['last_name']}';
      }
      final id = link['learner'] is int ? link['learner'] : null;
      return 'Child #$id';
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Disciplinary Records'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: provider.isLoading && children.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : (children.isEmpty
              ? const Center(child: Text('No children found.'))
              : _buildContent(
                  provider,
                  children,
                  childLabel,
                  records,
                  selectedId,
                )),
    );
  }

  Widget _buildContent(
      DisciplineProvider provider,
      List<dynamic> children,
      String Function(dynamic) childLabel,
      List<dynamic> records,
      int? selectedId,
      ) {
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
              decoration: const InputDecoration(border: OutlineInputBorder(), hintText: 'Choose child'),
              items: children.map<DropdownMenuItem<int>>((link) {
                final learner = link['learner'] is Map ? link['learner'] as Map : null;
                final id = learner != null
                    ? learner['id'] as int?
                    : (link['learner'] is int ? link['learner'] as int : null);
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
                  provider.selectChild(value, childLabel(link));
                }
              },
            ),
            const SizedBox(height: kSpacing24),
            Text('Disciplinary Records', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: kSpacing8),
            if (provider.isLoading)
              const Center(child: Padding(
                padding: EdgeInsets.all(kSpacing32),
                child: CircularProgressIndicator(),
              ))
            else if (records.isEmpty)
              const Text('No disciplinary records found for this child.')
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: records.length,
                itemBuilder: (context, index) {
                  final r = records[index] as Map<String, dynamic>;
                  final severity = r['severity'] as String? ?? 'LOW';
                  final severityColor = switch (severity) {
                    'HIGH' => kDanger,
                    'MEDIUM' => kWarning,
                    _ => kSuccess,
                  };
                  final incidentColor = _incidentColor(r['incident_type'] as String? ?? 'OTHER');

                  return Card(
                    margin: const EdgeInsets.only(bottom: kSpacing8),
                    child: Padding(
                      padding: const EdgeInsets.all(kSpacing12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Chip(
                                label: Text(r['incident_type'] ?? 'OTHER', style: const TextStyle(fontSize: 11)),
                                backgroundColor: incidentColor.withValues(alpha: 0.1),
                                visualDensity: VisualDensity.compact,
                              ),
                              const SizedBox(width: kSpacing8),
                              Chip(
                                label: Text(severity, style: const TextStyle(fontSize: 11)),
                                backgroundColor: severityColor.withValues(alpha: 0.1),
                                visualDensity: VisualDensity.compact,
                              ),
                            ],
                          ),
                          const SizedBox(height: kSpacing8),
                          Text(r['description'] as String? ?? '', style: Theme.of(context).textTheme.bodyMedium),
                          const SizedBox(height: kSpacing8),
                          Text('Action: ${r['action_taken'] as String? ?? 'None'}',
                              style: TextStyle(color: Colors.grey[700])),
                          const SizedBox(height: kSpacing4),
                          Row(
                            children: [
                              if (r['parent_notified'] == true)
                                const Chip(label: Text('Parent Notified'), backgroundColor: Colors.green),
                              if (r['resolved'] == true)
                                const Chip(label: Text('Resolved'), backgroundColor: Colors.blue),
                            ],
                          ),
                          const SizedBox(height: kSpacing4),
                          if (r['created_at'] != null)
                            Text(
                              'Recorded ${DateTime.parse(r['created_at'] as String).toLocal()}',
                              style: TextStyle(color: Colors.grey[500], fontSize: 12),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Color _incidentColor(String type) {
    switch (type) {
      case 'BULLYING':
        return kDanger;
      case 'CHEATING':
        return kSecondary;
      case 'DISRUPTION':
        return kWarning;
      case 'DAMAGE':
        return kAccent;
      case 'ABSENT':
        return kGray600;
      default:
        return kInfo;
    }
  }
}
