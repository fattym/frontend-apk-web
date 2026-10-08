import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:parent_app/features/exams/providers/exam_results_provider.dart';

class ExamResultsPage extends StatefulWidget {
  const ExamResultsPage({super.key});

  @override
  State<ExamResultsPage> createState() => _ExamResultsPageState();
}

class _ExamResultsPageState extends State<ExamResultsPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ExamResultsProvider>().fetchAllResults();
      context.read<ExamResultsProvider>().fetchToppers();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ExamResultsProvider>(
      builder: (context, provider, _) {
        return Scaffold(
          appBar: AppBar(
            title: const Text('Exam Results'),
            bottom: TabBar(
              controller: _tabController,
              tabs: const [
                Tab(text: 'Results'),
                Tab(text: 'Toppers'),
              ],
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: () {
                  provider.fetchAllResults();
                  provider.fetchToppers();
                },
              ),
            ],
          ),
          body: provider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildResultsTab(provider),
                    _buildToppersTab(provider),
                  ],
                ),
        );
      },
    );
  }

  Widget _buildResultsTab(ExamResultsProvider provider) {
    if (provider.summary == null) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.quiz, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No exam results available', style: TextStyle(fontSize: 16, color: Colors.grey)),
          ],
        ),
      );
    }

    final summary = provider.summary!;
    final topStudents = provider.results;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Summary Cards
          Row(
            children: [
              Expanded(child: _buildStatCard('Total Students', '${summary['total_students'] ?? 0}', Icons.people)),
              const SizedBox(width: 12),
              Expanded(child: _buildStatCard('Top Score', '${summary['top_score'] ?? 0}', Icons.emoji_events)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _buildStatCard('Average', '${summary['average_score'] ?? 0}', Icons.analytics)),
              const SizedBox(width: 12),
              Expanded(child: _buildStatCard('Passed', '${summary['passed_count'] ?? 0}', Icons.check_circle, color: Colors.green)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _buildStatCard('Failed', '${summary['failed_count'] ?? 0}', Icons.cancel, color: Colors.red)),
              const SizedBox(width: 12),
              const Expanded(child: SizedBox()), // Spacer
            ],
          ),
          const SizedBox(height: 24),
          Text('Top Students', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          topStudents.isEmpty
              ? const Text('No student data available')
              : ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: topStudents.length,
                  itemBuilder: (context, index) {
                    final student = topStudents[index];
                    return Card(
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: _getRankColor(index),
                          child: Text(
                            '${index + 1}',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                        ),
                        title: Text(student['student_name'] ?? 'Unknown'),
                        subtitle: Text('Grade: ${student['grade'] ?? '-'}'),
                        trailing: Text(
                          '${student['marks'] ?? 0}',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                      ),
                    );
                  },
                ),
        ],
      ),
    );
  }

  Widget _buildToppersTab(ExamResultsProvider provider) {
    if (provider.toppers.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.emoji_events, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No toppers data available', style: TextStyle(fontSize: 16, color: Colors.grey)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: provider.toppers.length,
      itemBuilder: (context, index) {
        final topper = provider.toppers[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: _getRankColor(index),
              child: Text(
                '${index + 1}',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
            title: Text(topper['student_name'] ?? 'Unknown'),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Marks: ${topper['marks'] ?? 0}'),
                Text('Exam: ${topper['exam'] ?? 'Unknown'}'),
              ],
            ),
            trailing: Chip(
              label: Text(topper['grade'] ?? '-'),
              backgroundColor: _getGradeColor(topper['grade'] ?? ''),
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, {Color? color}) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: color ?? Theme.of(context).colorScheme.primary, size: 32),
            const SizedBox(height: 8),
            Text(value, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
            Text(label, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  Color _getRankColor(int index) {
    switch (index) {
      case 0: return Colors.amber;
      case 1: return Colors.grey;
      case 2: return Colors.brown;
      default: return Colors.blue;
    }
  }

  Color _getGradeColor(String grade) {
    switch (grade) {
      case 'A+':
      case 'A':
        return Colors.green;
      case 'B+':
      case 'B':
        return Colors.blue;
      case 'C+':
      case 'C':
        return Colors.orange;
      case 'D':
        return Colors.red;
      case 'F':
        return Colors.redAccent;
      default:
        return Colors.grey;
    }
  }
}