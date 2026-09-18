import 'package:flutter/material.dart';
import '../../../core/theme/theme_tokens.dart';

// ═══════════════════════════════════════════════════════════════
// TEACHER NAVIGATION DRAWER (replaces BottomNavigationBar for teachers)
// ═══════════════════════════════════════════════════════════════

class TeacherNavDrawer extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const TeacherNavDrawer({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final items = [
      _NavItem(icon: Icons.dashboard, label: 'Dashboard', index: 0),
      _NavItem(icon: Icons.play_arrow, label: 'Course Flow', index: 1),
      _NavItem(icon: Icons.class_, label: 'My Classes', index: 2),
      _NavItem(icon: Icons.auto_stories, label: 'Course Studio', index: 3),
      _NavItem(icon: Icons.assessment, label: 'Schemes of Work', index: 4),
      _NavItem(icon: Icons.quiz, label: 'Assessments', index: 5),
      _NavItem(icon: Icons.task_alt, label: 'Teacher Assignments', index: 6),
      _NavItem(icon: Icons.check_box, label: 'Attendance', index: 7),
      _NavItem(icon: Icons.assignment, label: 'Homework', index: 8),
      _NavItem(icon: Icons.people, label: 'Learner Groups', index: 9),
      _NavItem(icon: Icons.sports_esports, label: 'Clubs & Activities', index: 10),
      _NavItem(icon: Icons.report_problem, label: 'Complaints', index: 11),
      _NavItem(icon: Icons.calendar_today, label: 'Events', index: 12),
    ];

    return SafeArea(
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(kSpacing24),
            decoration: BoxDecoration(
              color: kAccent,
              borderRadius: const BorderRadius.only(
                bottomRight: Radius.circular(kRadius16),
              ),
            ),
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 24,
                  backgroundColor: kWhite,
                  child: Icon(Icons.person, color: kAccent),
                ),
                const SizedBox(width: kSpacing12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Teacher',
                        style: TextStyle(
                          fontFamily: 'Baloo 2',
                          fontSize: kType18,
                          fontWeight: FontWeight.w700,
                          color: kWhite,
                        ),
                      ),
                      Text(
                        'Staff Member',
                        style: TextStyle(
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: kType12,
                          color: kWhite.withValues(alpha: 0.8),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: kSpacing8),
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];
                final isActive = currentIndex == item.index;
                return ListTile(
                  leading: Icon(
                    item.icon,
                    color: isActive ? kAccent : kNavy.withValues(alpha: 0.6),
                    size: 22,
                  ),
                  title: Text(
                    item.label,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: kType14,
                      fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                      color: isActive ? kAccent : kNavy.withValues(alpha: 0.8),
                    ),
                  ),
                  tileColor: isActive ? kAccent.withValues(alpha: 0.08) : Colors.transparent,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(kRadius12),
                  ),
                  onTap: () => onTap(item.index),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.all(kSpacing16),
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: kNavy.withValues(alpha: 0.1))),
            ),
            child: Row(
              children: [
                const Icon(Icons.logout, size: 20, color: kDanger),
                const SizedBox(width: kSpacing8),
                Text(
                  'Logout',
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: kType14,
                    fontWeight: FontWeight.w600,
                    color: kDanger,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final String label;
  final int index;

  const _NavItem({required this.icon, required this.label, required this.index});
}
