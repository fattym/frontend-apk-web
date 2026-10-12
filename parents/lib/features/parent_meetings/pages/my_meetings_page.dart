import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/ptm_provider.dart';
import '../../../core/theme/theme_tokens.dart';

class MyMeetingsPage extends StatefulWidget {
  const MyMeetingsPage({super.key});

  @override
  State<MyMeetingsPage> createState() => _MyMeetingsPageState();
}

class _MyMeetingsPageState extends State<MyMeetingsPage> {
  final _noteController = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      final provider = context.read<PtmProvider>();
      if (provider.meetings.isEmpty) {
        provider.fetchMeetings();
      }
    });
  }

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PtmProvider>();
    final meetings = provider.filteredMeetings;
    final statusOptions = [
      {'value': null, 'label': 'All'},
      {'value': 'PENDING', 'label': 'Pending'},
      {'value': 'CONFIRMED', 'label': 'Confirmed'},
      {'value': 'COMPLETED', 'label': 'Completed'},
      {'value': 'CANCELLED', 'label': 'Cancelled'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Meetings'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: kSpacing8),
            child: DropdownButton<String?>(
              value: provider.filteredMeetings == provider.meetings ? null : provider.error,
              items: statusOptions.map((opt) {
                return DropdownMenuItem<String?>(
                  value: opt['value'] as String?,
                  child: Text(opt['label'] as String),
                );
              }).toList(),
              hint: const Text('Filter'),
              onChanged: (String? value) {
                provider.filterByStatus(value);
              },
            ),
          ),
        ],
      ),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : provider.hasError
              ? Center(child: Text('Error: ${provider.error}', style: TextStyle(color: kDanger)))
              : RefreshIndicator(
                  onRefresh: provider.refresh,
                  child: meetings.isEmpty
                      ? const Center(child: Text('No meetings found.'))
                      : ListView.builder(
                          padding: const EdgeInsets.all(kSpacing16),
                          itemCount: meetings.length,
                          itemBuilder: (context, index) {
                            final m = meetings[index] as Map<String, dynamic>;
                            return _MeetingCard(meeting: m);
                          },
                        ),
                ),
    );
  }

  Widget _MeetingCard({required Map<String, dynamic> meeting}) {
    final status = meeting['status'] as String? ?? 'PENDING';
    final statusColor = switch (status) {
      'CONFIRMED' => kInfo,
      'COMPLETED' => kSuccess,
      'CANCELLED' => kGray600,
      _ => kWarning,
    };

    String teacherName = '';
    final teacher = meeting['teacher'];
    if (teacher is Map) {
      teacherName = '${teacher['first_name']} ${teacher['last_name']}';
    }

    String studentName = '';
    final student = meeting['student'];
    if (student is Map) {
      studentName = '${student['first_name']} ${student['last_name']}';
    }

    final scheduled = meeting['scheduled_at'] != null
        ? DateTime.parse(meeting['scheduled_at'] as String).toLocal()
        : null;
    final notes = List<dynamic>.from(meeting['meeting_notes'] ?? []);

    return Card(
      margin: const EdgeInsets.only(bottom: kSpacing12),
      child: Padding(
        padding: const EdgeInsets.all(kSpacing12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    teacherName.isNotEmpty ? 'Meeting with $teacherName' : 'Parent-Teacher Meeting',
                    style: Theme.of(context).textTheme.titleMedium,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Chip(
                  label: Text(status, style: const TextStyle(fontSize: 11)),
                  backgroundColor: statusColor.withValues(alpha: 0.1),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
            const SizedBox(height: kSpacing8),
            Text('For: $studentName', style: TextStyle(color: Colors.grey[700])),
            Text('Scheduled: ${scheduled != null ? scheduled.toString().split('.')[0] : 'TBD'}',
                style: TextStyle(color: Colors.grey[600])),
            if (meeting['location'] != null && (meeting['location'] as String).isNotEmpty)
              Text('Location: ${meeting['location']}', style: TextStyle(color: Colors.grey[600])),
            if (meeting['agenda'] != null && (meeting['agenda'] as String).isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: kSpacing8),
                child: Text('Agenda: ${meeting['agenda']}', style: Theme.of(context).textTheme.bodyMedium),
              ),
            if (notes.isNotEmpty) ...[
              const SizedBox(height: kSpacing8),
              Text('Notes (${notes.length}):', style: TextStyle(color: kGray600, fontSize: 13)),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: notes.length,
                itemBuilder: (context, index) {
                  final n = notes[index] as Map<String, dynamic>;
                  return Padding(
                    padding: const EdgeInsets.only(top: kSpacing4, left: kSpacing8),
                    child: Text('- ${n['content'] as String? ?? ''}', style: TextStyle(color: Colors.grey[700])),
                  );
                },
              ),
            ],
            const SizedBox(height: kSpacing8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (status == 'PENDING')
                  FilledButton.icon(
                    onPressed: () {
                      context.read<PtmProvider>().confirmMeeting(meeting['id'] as int);
                    },
                    icon: const Icon(Icons.check, size: 16),
                    label: const Text('Confirm Attendance'),
                  ),
                const SizedBox(height: kSpacing8),
                SizedBox(
                  width: double.infinity,
                  child: TextFormField(
                    controller: _noteController,
                    decoration: InputDecoration(
                      hintText: 'Add a note for this meeting',
                      isDense: true,
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.send),
                        onPressed: () {
                          final content = _noteController.text.trim();
                          if (content.isNotEmpty) {
                            context.read<PtmProvider>().addNote(meeting['id'] as int, content);
                            _noteController.clear();
                          }
                        },
                        color: kAccent,
                      ),
                    ),
                    maxLines: 2,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
