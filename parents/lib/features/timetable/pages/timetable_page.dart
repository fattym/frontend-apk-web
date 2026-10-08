import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:parent_app/features/timetable/providers/timetable_provider.dart';

class TimetablePage extends StatefulWidget {
  const TimetablePage({super.key});

  @override
  State<TimetablePage> createState() => _TimetablePageState();
}

class _TimetablePageState extends State<TimetablePage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TimetableProvider>().fetchSlots();
      context.read<TimetableProvider>().fetchConfig();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<TimetableProvider>(
      builder: (context, provider, _) {
        return Scaffold(
          appBar: AppBar(
            title: const Text('Timetable'),
            actions: [
              if (provider.config != null)
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: () {
                    provider.fetchSlots();
                    provider.fetchConfig();
                  },
                ),
            ],
          ),
          body: provider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : provider.slots.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.schedule, size: 64, color: Colors.grey),
                          const SizedBox(height: 16),
                          Text(
                            provider.config == null
                                ? 'No timetable configuration found'
                                : 'No timetable generated yet',
                            style: const TextStyle(fontSize: 16, color: Colors.grey),
                          ),
                          if (provider.config != null) ...[
                            const SizedBox(height: 16),
                            FilledButton.icon(
                              icon: const Icon(Icons.auto_awesome),
                              label: const Text('Generate Timetable'),
                              onPressed: () async {
                                final success = await provider.generateTimetable();
                                if (!mounted) return;
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(success
                                        ? 'Timetable generated successfully!'
                                        : 'Failed to generate timetable'),
                                  ),
                                );
                              },
                            ),
                          ],
                        ],
                      ),
                    )
                  : _buildTimetable(provider.slots),
        );
      },
    );
  }

  Widget _buildTimetable(List<dynamic> slots) {
    // Group slots by day
    final days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    final Map<String, List<dynamic>> slotsByDay = {};
    for (final slot in slots) {
      final day = slot['day_of_week'] as String? ?? '';
      slotsByDay.putIfAbsent(day, () => []).add(slot);
    }

    // Sort slots by start_time within each day
    for (final daySlots in slotsByDay.values) {
      daySlots.sort((a, b) {
        final aTime = a['start_time'] as String? ?? '00:00';
        final bTime = b['start_time'] as String? ?? '00:00';
        return aTime.compareTo(bTime);
      });
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: days
            .where((day) => slotsByDay.containsKey(day) && slotsByDay[day]!.isNotEmpty)
            .map((day) => _buildDayCard(day, slotsByDay[day]!))
            .toList(),
      ),
    );
  }

  Widget _buildDayCard(String day, List<dynamic> daySlots) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primaryContainer,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Text(
              _formatDay(day),
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.onPrimaryContainer,
              ),
            ),
          ),
          ...daySlots.map((slot) => _buildSlotTile(slot)),
        ],
      ),
    );
  }

  Widget _buildSlotTile(dynamic slot) {
    final isBreak = slot['is_break'] as bool? ?? false;
    final subject = slot['subject'];
    final teacher = slot['teacher'];
    final startTime = slot['start_time'] as String? ?? '';
    final endTime = slot['end_time'] as String? ?? '';
    final breakName = slot['break_name'] as String? ?? '';
    final room = slot['room'] as String? ?? '';
    final stream = slot['stream'];

    return ListTile(
      leading: CircleAvatar(
        backgroundColor: isBreak ? Colors.orange : Theme.of(context).colorScheme.primaryContainer,
        child: Icon(
          isBreak ? Icons.coffee : Icons.book,
          color: isBreak ? Colors.white : Theme.of(context).colorScheme.onPrimaryContainer,
        ),
      ),
      title: Text(
        isBreak ? breakName : (subject is Map ? subject['name'] ?? 'Unknown' : subject?.toString() ?? 'Unknown'),
        style: const TextStyle(fontWeight: FontWeight.w500),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isBreak) ...[
            if (teacher is Map)
              Text('Teacher: ${teacher['first_name'] ?? ''} ${teacher['last_name'] ?? ''}')
            else if (teacher != null)
              Text('Teacher: $teacher'),
            if (stream is Map)
              Text('Class: ${stream['name'] ?? ''}')
            else if (stream != null)
              Text('Class: $stream'),
            if (room.isNotEmpty) Text('Room: $room'),
          ],
        ],
      ),
      trailing: Text(
        '$startTime - ${endTime.isNotEmpty ? endTime : ''}',
        style: TextStyle(
          color: Theme.of(context).colorScheme.onSurfaceVariant,
          fontSize: 12,
        ),
      ),
    );
  }

  String _formatDay(String day) {
    const dayNames = {
      'MONDAY': 'Monday',
      'TUESDAY': 'Tuesday',
      'WEDNESDAY': 'Wednesday',
      'THURSDAY': 'Thursday',
      'FRIDAY': 'Friday',
      'SATURDAY': 'Saturday',
      'SUNDAY': 'Sunday',
    };
    return dayNames[day] ?? day;
  }
}