import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/alumni_provider.dart';
import '../../../core/theme/theme_tokens.dart';

class AlumniNetworkPage extends StatefulWidget {
  const AlumniNetworkPage({super.key});

  @override
  State<AlumniNetworkPage> createState() => _AlumniNetworkPageState();
}

class _AlumniNetworkPageState extends State<AlumniNetworkPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      final provider = context.read<AlumniProvider>();
      if (provider.events.isEmpty) {
        provider.fetchEvents();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AlumniProvider>();
    final events = provider.filteredEvents;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Alumni Network'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        bottom: AppBar(
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          elevation: 0,
          title: Container(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.onInverseSurface.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(kRadius12),
            ),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search events...',
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: kSpacing12, vertical: kSpacing8),
                isDense: true,
                suffixIcon: provider.filteredEvents.isEmpty && provider.events.isNotEmpty
                    ? null
                    : const Icon(Icons.search, size: 20),
              ),
              onChanged: provider.setSearchQuery,
            ),
          ),
        ),
      ),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : provider.hasError
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Failed to load events', style: TextStyle(color: Colors.grey[600])),
                      const SizedBox(height: 8),
                      Text(provider.error!, style: const TextStyle(fontSize: 12)),
                      const SizedBox(height: 16),
                      FilledButton.icon(
                        onPressed: provider.refresh,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: provider.refresh,
                  child: events.isEmpty
                      ? ListView(
                          padding: const EdgeInsets.all(kSpacing16),
                          children: [
                            const Center(child: Text('No alumni events found.')),
                          ],
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(kSpacing16),
                          itemCount: events.length,
                          itemBuilder: (context, index) {
                            final ev = events[index] as Map<String, dynamic>;
                            return Card(
                              margin: const EdgeInsets.only(bottom: kSpacing12),
                              child: Padding(
                                padding: const EdgeInsets.all(kSpacing12),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(ev['title'] as String? ?? 'Event',
                                        style: Theme.of(context).textTheme.titleMedium),
                                    const SizedBox(height: kSpacing4),
                                    Text(
                                      _formatDate(ev['event_date'] as String?),
                                      style: TextStyle(color: kInfo, fontSize: 13),
                                    ),
                                    if (ev['location'] != null && (ev['location'] as String).isNotEmpty)
                                      Text(ev['location'] as String,
                                          style: TextStyle(color: Colors.grey[600])),
                                    const SizedBox(height: kSpacing8),
                                    Text(ev['description'] as String? ?? ''),
                                    if (ev['alumni_attendees'] != null)
                                      Padding(
                                        padding: const EdgeInsets.only(top: kSpacing8),
                                        child: Text('${(ev['alumni_attendees'] as List).length} alumni attending',
                                            style: TextStyle(color: kGray600, fontSize: 12)),
                                      ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),
    );
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final date = DateTime.parse(dateStr);
      final now = DateTime.now();
      final diff = date.difference(now).inDays;
      if (diff == 0) return 'Today';
      if (diff == 1) return 'Tomorrow';
      if (diff == -1) return 'Yesterday';
      if (diff > 0) return '${date.toLocal()}'.split(' ')[0];
      return '${date.toLocal()}'.split(' ')[0];
    } catch (_) {
      return dateStr;
    }
  }
}
