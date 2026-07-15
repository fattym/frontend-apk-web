import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/announcements_provider.dart';

class AnnouncementsPage extends StatefulWidget {
  const AnnouncementsPage({super.key});

  @override
  State<AnnouncementsPage> createState() => _AnnouncementsPageState();
}

class _AnnouncementsPageState extends State<AnnouncementsPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<AnnouncementsProvider>().fetchAnnouncements());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Announcements'), backgroundColor: Theme.of(context).colorScheme.inversePrimary),
      body: Consumer<AnnouncementsProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (provider.announcements.isEmpty) {
            return const Center(child: Text('No announcements yet.'));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(8),
            itemCount: provider.announcements.length,
            itemBuilder: (context, index) {
              final announcement = provider.announcements[index];
              return Card(
                margin: const EdgeInsets.symmetric(vertical: 4),
                child: ListTile(
                  title: Text(announcement['title'] ?? ''),
                  subtitle: Text(announcement['content'] ?? '', maxLines: 2, overflow: TextOverflow.ellipsis),
                  trailing: announcement['is_published'] == true
                      ? const Icon(Icons.visibility, color: Colors.green)
                      : const Icon(Icons.visibility_off, color: Colors.grey),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
