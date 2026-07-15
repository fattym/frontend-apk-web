import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/requirements_provider.dart';

class ParentRequirementsPage extends StatefulWidget {
  const ParentRequirementsPage({super.key});

  @override
  State<ParentRequirementsPage> createState() => _ParentRequirementsPageState();
}

class _ParentRequirementsPageState extends State<ParentRequirementsPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      final provider = context.read<RequirementsProvider>();
      if (provider.requiredItems.isEmpty) {
        provider.fetchRequiredItems();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<RequirementsProvider>();
    final requiredItems = provider.requiredItems;

    return Scaffold(
      appBar: AppBar(title: const Text('Required Items'), backgroundColor: Theme.of(context).colorScheme.inversePrimary),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async {
                await provider.fetchRequiredItems();
              },
              child: requiredItems.isEmpty
                  ? const Center(child: Text('No required items published yet.'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: requiredItems.length,
                      itemBuilder: (context, index) {
                        final item = requiredItems[index];
                        final options = item['options'] as List<dynamic>? ?? [];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        _display(item['name']),
                                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                    if (item['is_mandatory'] == true)
                                      const Chip(label: Text('Mandatory'), backgroundColor: Colors.red),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${_display(item['class_level'])} • ${_display(item['term'])}',
                                  style: TextStyle(color: Colors.grey[600], fontSize: 14),
                                ),
                                if (item['description'] != null && item['description'].toString().isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 8),
                                    child: Text(item['description'].toString()),
                                  ),
                                const SizedBox(height: 12),
                                const Text('Buying Options:', style: TextStyle(fontWeight: FontWeight.w600)),
                                const SizedBox(height: 8),
                                for (final option in options)
                                  _buildOption(option),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }

  Widget _buildOption(Map<String, dynamic> option) {
    final isRecommended = option['is_recommended'] == true;
    final sourceType = option['source_type']?.toString() ?? '';
    final price = option['price']?.toString() ?? '';
    final location = option['location']?.toString() ?? '';
    final delivery = option['delivery_available'] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(
          color: isRecommended ? Colors.green : Colors.grey[300]!,
          width: isRecommended ? 2 : 1,
        ),
        borderRadius: BorderRadius.circular(8),
        color: isRecommended ? Colors.green[50] : null,
      ),
      child: Row(
        children: [
          Icon(
            sourceType == 'school' ? Icons.school : Icons.business,
            color: sourceType == 'school' ? Colors.blue : Colors.purple,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      'KES $price',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    if (isRecommended) ...[
                      const SizedBox(width: 8),
                      const Text('✅ Recommended', style: TextStyle(color: Colors.green, fontSize: 12)),
                    ],
                  ],
                ),
                if (location.isNotEmpty) Text('📍 $location', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                if (delivery) const Text('🚚 Delivery Available', style: TextStyle(color: Colors.blue, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _display(dynamic value) {
    if (value is Map) return value['name']?.toString() ?? value['description']?.toString() ?? '';
    return value?.toString() ?? '';
  }
}
