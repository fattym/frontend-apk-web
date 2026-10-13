import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:parent_app/core/theme/theme_tokens.dart';
import 'package:parent_app/core/theme/clay_card.dart';
import 'package:parent_app/core/auth/auth_provider.dart';
import 'package:parent_app/features/teacher/providers/assessment_provider.dart';
import 'package:parent_app/core/models/assessment_task.dart';
import '../../dashboards/providers/teacher_nav_drawer.dart';
class AssessmentsPage extends StatefulWidget {
  const AssessmentsPage({super.key});

  @override
  State<AssessmentsPage> createState() => _AssessmentsPageState();
}

class _AssessmentsPageState extends State<AssessmentsPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AssessmentProvider>().fetchTasks();
    });
  }

  Future<void> _openDoSheet(BuildContext ctx, AssessmentTask task) async {
    final provider = ctx.read<AssessmentProvider>();
    final result = await provider.fetchStudentResult(task.id);
    String level = result.levelAchieved;
    String remark = result.remark;
    final formKey = GlobalKey<FormState>();

    await showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: Theme.of(ctx).colorScheme.brightness == Brightness.dark
          ? const Color(0xFF1E293B)
          : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(kRadiusLg)),
      ),
      builder: (sheetCtx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(sheetCtx).viewInsets.bottom + kSpacing16,
          left: kSpacing16,
          right: kSpacing16,
          top: kSpacing16,
        ),
        child: StatefulBuilder(
          builder: (stateCtx, setSheetState) => Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  task.subStrand.isNotEmpty ? task.subStrand : task.title,
                  style: TextStyle(
                    fontFamily: 'Baloo 2',
                    fontSize: kType21,
                    fontWeight: FontWeight.w700,
                    color: Theme.of(ctx).colorScheme.onSurface,
                  ),
                ),
                Text('${task.learningAreaName} · ${task.strand}',
                    style: TextStyle(color: ctx.inkMutedColor, fontSize: 12)),
                const SizedBox(height: kSpacing16),
                Text('Select your performance level',
                    style: TextStyle(
                        fontWeight: FontWeight.w700, color: Theme.of(ctx).colorScheme.onSurface)),
                Wrap(
                  spacing: kSpacing8,
                  children: AssessmentTaskResult.levels.map((lvl) => ChoiceChip(
                    label: Text(
                      '${lvl} — ${AssessmentTaskResult.levelLabel(lvl)}',
                      style: TextStyle(
                        color: level == lvl ? Colors.white : Theme.of(ctx).colorScheme.onSurface,
                      ),
                    ),
                    selected: level == lvl,
                    onSelected: (_) => setSheetState(() => level = lvl),
                    backgroundColor: _levelBackground(lvl),
                    selectedColor: _levelColor(lvl),
                  )).toList(),
                ),
                const SizedBox(height: kSpacing12),
                TextFormField(
                  initialValue: remark,
                  onChanged: (v) => remark = v,
                  minLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Teacher remark / evidence note',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: kSpacing16),
                FilledButton.icon(
                  onPressed: () async {
                    await provider.submitResult(task, level, remark);
                    if (sheetCtx.mounted) Navigator.of(sheetCtx).pop();
                    if (ctx.mounted) {
                      ScaffoldMessenger.of(ctx).showSnackBar(
                        const SnackBar(content: Text('Your submission was saved.')),
                      );
                    }
                  },
                  icon: const Icon(Icons.save),
                  label: const Text('Submit & Publish'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AssessmentProvider>();
    final role = context.watch<AuthProvider>().user?['role'] ?? '';
    final bool canDo = role == 'STUDENT';

    return Scaffold(
      appBar: AppBar(
        backgroundColor: context.appBarBackgroundColor,
        elevation: 0,
        title: Text(
          'Assessments',
          style: TextStyle(
            fontFamily: 'Baloo 2',
            fontSize: kType21,
            fontWeight: FontWeight.w700,
            color: context.appBarForegroundColor,
          ),
        ),
        centerTitle: true,
        leading: Builder(builder: (context) {
          if (role == 'TEACHER' || role == 'STAFF') {
            return IconButton(
              icon: Icon(Icons.menu, color: context.appBarForegroundColor),
              onPressed: () => Scaffold.of(context).openDrawer(),
            );
          }
          return const SizedBox.shrink();
        }),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh, color: context.appBarForegroundColor),
            onPressed: provider.isLoading ? null : provider.fetchTasks,
          )
        ],
      ),
      drawer: (role == 'TEACHER' || role == 'STAFF')
          ? TeacherNavDrawer(currentIndex: 5, onTap: (i) {})
          : null,
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : provider.error != null
              ? Center(child: Text(provider.error!, style: const TextStyle(color: Colors.red)))
              : provider.tasks.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(kSpacing16),
                        child: Text(
                          'No CBC assessment tasks published yet. Check back soon!',
                          style: TextStyle(color: context.inkMutedColor),
                        ),
                      ),
                    )
                  : ListView(
                      padding: const EdgeInsets.all(kSpacing16),
                      children: [
                        Text(
                          '${provider.tasks.length} Published ${provider.tasks.length == 1 ? 'Task' : 'Tasks'}',
                          style: TextStyle(
                            fontFamily: 'Baloo 2',
                            fontSize: kType18,
                            fontWeight: FontWeight.w700,
                            color: context.appBarForegroundColor,
                          ),
                        ),
                        const SizedBox(height: kSpacing8),
                        ...provider.tasks.map((t) => _taskCard(context, t, canDo)),
                      ],
                    ),
    );
  }

  Widget _taskCard(BuildContext context, AssessmentTask task, bool canDo) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: kSpacing8),
      child: ClayContainer(
        borderRadius: kRadius12,
        child: Padding(
          padding: const EdgeInsets.all(kSpacing16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      task.subStrand.isNotEmpty ? task.subStrand : task.title,
                      style: TextStyle(
                        fontFamily: 'Baloo 2',
                        fontSize: kType18,
                        fontWeight: FontWeight.w700,
                        color: context.appBarForegroundColor,
                      ),
                    ),
                  ),
                  _statusPill(task.status),
                ],
              ),
              const SizedBox(height: kSpacing8),
              Text(
                '${task.learningAreaName} · Strand: ${task.strand}',
                style: TextStyle(color: context.inkMutedColor, fontSize: 12),
              ),
              const SizedBox(height: kSpacing12),
              if (canDo)
                FilledButton.icon(
                  onPressed: () => _openDoSheet(context, task),
                  icon: const Icon(Icons.edit_note),
                  label: Text(task.isSubmitted ? 'Update Response' : 'Do Assessment'),
                )
              else
                Text(
                  '${task.results.length} learner(s) scored',
                  style: TextStyle(color: context.inkMutedColor, fontSize: 12),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statusPill(String status) {
    final isDone = status == 'COMPLETED';
    final text = isDone
        ? 'Completed'
        : status == 'ACTIVE'
            ? 'Active'
            : status.toLowerCase();
    final swatch = isDone
        ? Colors.green
        : status == 'ACTIVE'
            ? Colors.amber
            : Colors.grey;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: swatch.withOpacity(0.15),
        borderRadius: BorderRadius.circular(kRadiusSm),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 10,
          color: swatch.withOpacity(0.85),
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Color _levelColor(String level) {
    switch (level) {
      case 'EE':
        return Colors.green;
      case 'ME':
        return Colors.blue;
      case 'AE':
        return Colors.orange;
      case 'BE':
        return Colors.red;
      default:
        return Colors.blue;
    }
  }

  Color _levelBackground(String level) {
    switch (level) {
      case 'EE':
        return Colors.green.withOpacity(0.1);
      case 'ME':
        return Colors.blue.withOpacity(0.1);
      case 'AE':
        return Colors.orange.withOpacity(0.1);
      case 'BE':
        return Colors.red.withOpacity(0.1);
      default:
        return Colors.transparent;
    }
  }
}
