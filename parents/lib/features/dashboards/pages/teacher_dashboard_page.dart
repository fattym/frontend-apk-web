import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/theme_tokens.dart';
import '../../../core/theme/clay_card.dart';
import '../../onboarding/teacher_onboarding_page.dart';
import '../providers/teacher_nav_drawer.dart';
import '../providers/dashboard_provider.dart';

// ═══════════════════════════════════════════════════════════════
// TEACHER DASHBOARD (Redesigned to match web version)
// 8 stat tiles + full sections
// ═══════════════════════════════════════════════════════════════

class TeacherDashboardPage extends StatefulWidget {
  const TeacherDashboardPage({super.key});

  @override
  State<TeacherDashboardPage> createState() => _TeacherDashboardPageState();
}

class _TeacherDashboardPageState extends State<TeacherDashboardPage> {
  int _selectedNavIndex = 0;

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DashboardProvider>();
    return Scaffold(
      appBar: AppBar(
        backgroundColor: kWhite,
        elevation: 0,
        title: Text(
          'Teacher Dashboard',
          style: TextStyle(
            fontFamily: 'Baloo 2',
            fontSize: kType21,
            fontWeight: FontWeight.w700,
            color: kNavy,
          ),
        ),
        centerTitle: true,
        leading: Builder(
          builder: (context) => IconButton(
            icon: Icon(Icons.menu, color: kNavy),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.notifications, color: kNavy),
            onPressed: () {},
          ),
          const SizedBox(width: kSpacing8),
        ],
      ),
      drawer: TeacherNavDrawer(
        currentIndex: _selectedNavIndex,
        onTap: (index) {
          setState(() => _selectedNavIndex = index);
          Navigator.of(context).pop();
          _handleNavTap(index);
        },
      ),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : provider.hasError
              ? Center(child: Text('Error: ${provider.errorMessage}'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(kSpacing16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ═══ Welcome Banner ═══
                      ClayContainer(
                        borderRadius: kRadius16,
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(kSpacing20),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [kAccent, kAccentSoft],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(kRadius16),
                          ),
                          child: Row(
                            children: [
                              const CircleAvatar(
                                radius: 28,
                                backgroundColor: kWhite,
                                child: Icon(Icons.school, color: kAccent, size: 28),
                              ),
                              const SizedBox(width: kSpacing16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Welcome back, Teacher!',
                                      style: TextStyle(
                                        fontFamily: 'Baloo 2',
                                        fontSize: kType18,
                                        fontWeight: FontWeight.w700,
                                        color: kWhite,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'You have ${provider.classes.length} classes and ${provider.students.length} students.',
                                      style: TextStyle(
                                        fontFamily: 'Plus Jakarta Sans',
                                        fontSize: kType14,
                                        color: kWhite.withValues(alpha: 0.9),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: kSpacing24),

                      // ═══ Stats Grid (8 tiles matching web) ═══
                      Text(
                        'Overview',
                        style: TextStyle(
                          fontFamily: 'Baloo 2',
                          fontSize: kType18,
                          fontWeight: FontWeight.w700,
                          color: kNavy,
                        ),
                      ),
                      const SizedBox(height: kSpacing12),
                      Wrap(
                        spacing: kSpacing12,
                        runSpacing: kSpacing12,
                        children: [
                          _StatTile(
                            icon: Icons.class_,
                            label: 'Classes',
                            value: '${provider.classes.length}',
                            color: kAccent,
                          ),
                          _StatTile(
                            icon: Icons.people,
                            label: 'Students',
                            value: '${provider.students.length}',
                            color: kPrimary,
                          ),
                          _StatTile(
                            icon: Icons.quiz,
                            label: 'Assessments',
                            value: '0',
                            color: kSecondary,
                          ),
                          _StatTile(
                            icon: Icons.check_box,
                            label: 'Attendance',
                            value: '96%',
                            color: kTeal,
                          ),
                          _StatTile(
                            icon: Icons.assignment,
                            label: 'Homework',
                            value: '5',
                            color: kAccentSoft,
                          ),
                          _StatTile(
                            icon: Icons.sports_esports,
                            label: 'Clubs',
                            value: '2',
                            color: kAccent,
                          ),
                          _StatTile(
                            icon: Icons.calendar_today,
                            label: 'Events',
                            value: '3',
                            color: kSecondary,
                          ),
                          _StatTile(
                            icon: Icons.auto_awesome,
                            label: 'AI Tasks',
                            value: '0',
                            color: kTeal,
                          ),
                        ],
                      ),
                      const SizedBox(height: kSpacing24),

                      // ═══ My Classes Section ═══
                      Text(
                        'My Classes',
                        style: TextStyle(
                          fontFamily: 'Baloo 2',
                          fontSize: kType18,
                          fontWeight: FontWeight.w700,
                          color: kNavy,
                        ),
                      ),
                      const SizedBox(height: kSpacing8),
                      if (provider.classes.isEmpty)
                        ClayContainer(
                          borderRadius: kRadius12,
                          child: const Padding(
                            padding: EdgeInsets.all(kSpacing16),
                            child: Center(
                              child: Text(
                                'No classes yet. Start by creating a class.',
                                style: TextStyle(color: kGray600),
                              ),
                            ),
                          ),
                        )
                      else
                        ...provider.classes.map((c) => ClayContainer(
                              borderRadius: kRadius12,
                              child: Padding(
                                padding: const EdgeInsets.all(kSpacing12),
                                child: Row(
                                  children: [
                                    Icon(Icons.class_, color: kAccent, size: 24),
                                    const SizedBox(width: kSpacing12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            c['name'] ?? 'Unknown Class',
                                            style: TextStyle(
                                              fontFamily: 'Plus Jakarta Sans',
                                              fontSize: kType14,
                                              fontWeight: FontWeight.w700,
                                              color: kNavy,
                                            ),
                                          ),
                                          Text(
                                            '${c['students'] ?? 0} students',
                                            style: TextStyle(
                                              fontFamily: 'Plus Jakarta Sans',
                                              fontSize: kType12,
                                              color: kGray600,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Icon(Icons.chevron_right, color: kGray400),
                                  ],
                                ),
                              ),
                            )),
                      const SizedBox(height: kSpacing24),

                      // ═══ Upcoming Assessments ═══
                      Text(
                        'Upcoming Assessments',
                        style: TextStyle(
                          fontFamily: 'Baloo 2',
                          fontSize: kType18,
                          fontWeight: FontWeight.w700,
                          color: kNavy,
                        ),
                      ),
                      const SizedBox(height: kSpacing8),
                      ClayContainer(
                        borderRadius: kRadius12,
                        child: Padding(
                          padding: const EdgeInsets.all(kSpacing16),
                          child: Column(
                            children: [
                              _AssessmentItem(
                                title: 'Mathematics Mid-Term',
                                subtitle: 'Grade 7 • Due in 3 days',
                                status: 'Pending',
                                statusColor: kAmber,
                              ),
                              const Divider(height: kSpacing16),
                              _AssessmentItem(
                                title: 'Science Practical',
                                subtitle: 'Grade 8 • Due in 5 days',
                                status: 'Pending',
                                statusColor: kAmber,
                              ),
                              const Divider(height: kSpacing16),
                              _AssessmentItem(
                                title: 'English Essay',
                                subtitle: 'Grade 9 • Due in 1 week',
                                status: 'Draft',
                                statusColor: kGray400,
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: kSpacing24),

                      // ═══ Recent Activity ═══
                      Text(
                        'Recent Activity',
                        style: TextStyle(
                          fontFamily: 'Baloo 2',
                          fontSize: kType18,
                          fontWeight: FontWeight.w700,
                          color: kNavy,
                        ),
                      ),
                      const SizedBox(height: kSpacing8),
                      ClayContainer(
                        borderRadius: kRadius12,
                        child: Padding(
                          padding: const EdgeInsets.all(kSpacing16),
                          child: Column(
                            children: [
                              _ActivityItem(
                                icon: Icons.add_circle,
                                title: 'Created Grade 7 Math Class',
                                time: '2 hours ago',
                              ),
                              const Divider(height: kSpacing16),
                              _ActivityItem(
                                icon: Icons.upload,
                                title: 'Uploaded CSV for Grade 8',
                                time: '1 day ago',
                              ),
                              const Divider(height: kSpacing16),
                              _ActivityItem(
                                icon: Icons.edit,
                                title: 'Updated Scheme of Work',
                                time: '3 days ago',
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: kSpacing24),
                    ],
                  ),
                ),
    );
  }

  void _handleNavTap(int index) {
    switch (index) {
      case 0:
        // Already on dashboard
        break;
      case 1:
        if (context.mounted) {
          Navigator.of(context).pushNamed('/course-flow');
        }
        break;
      case 2:
        if (context.mounted) {
          Navigator.of(context).pushNamed('/my-classes');
        }
        break;
      case 3:
        if (context.mounted) {
          Navigator.of(context).pushNamed('/course-studio');
        }
        break;
      case 4:
        if (context.mounted) {
          Navigator.of(context).pushNamed('/schemes-of-work');
        }
        break;
      case 5:
        if (context.mounted) {
          Navigator.of(context).pushNamed('/assessments');
        }
        break;
      case 6:
        if (context.mounted) {
          Navigator.of(context).pushNamed('/teacher-assignments');
        }
        break;
      case 7:
        if (context.mounted) {
          Navigator.of(context).pushNamed('/attendance');
        }
        break;
      case 8:
        if (context.mounted) {
          Navigator.of(context).pushNamed('/homework');
        }
        break;
      case 9:
        if (context.mounted) {
          Navigator.of(context).pushNamed('/learner-groups');
        }
        break;
      case 10:
        if (context.mounted) {
          Navigator.of(context).pushNamed('/clubs-activities');
        }
        break;
      case 11:
        if (context.mounted) {
          Navigator.of(context).pushNamed('/complaints');
        }
        break;
      case 12:
        if (context.mounted) {
          Navigator.of(context).pushNamed('/events');
        }
        break;
    }
  }
}

class _StatTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatTile({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 140,
      padding: const EdgeInsets.all(kSpacing12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(kRadius12),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: kSpacing8),
          Text(
            value,
            style: TextStyle(
              fontFamily: 'Baloo 2',
              fontSize: kType21,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: kType12,
              color: kGray600,
            ),
          ),
        ],
      ),
    );
  }
}

class _AssessmentItem extends StatelessWidget {
  final String title;
  final String subtitle;
  final String status;
  final Color statusColor;

  const _AssessmentItem({
    required this.title,
    required this.subtitle,
    required this.status,
    required this.statusColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: kType14,
                  fontWeight: FontWeight.w600,
                  color: kNavy,
                ),
              ),
              Text(
                subtitle,
                style: TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: kType12,
                  color: kGray600,
                ),
              ),
            ],
          ),
        ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: kSpacing8, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(kRadiusFull),
            ),
            child: Text(
              status,
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: kType12,
                fontWeight: FontWeight.w600,
                color: statusColor,
              ),
            ),
          ),
      ],
    );
  }
}

class _ActivityItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String time;

  const _ActivityItem({
    required this.icon,
    required this.title,
    required this.time,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircleAvatar(
          radius: 16,
          backgroundColor: kAccent.withValues(alpha: 0.1),
          child: Icon(icon, size: 16, color: kAccent),
        ),
        const SizedBox(width: kSpacing12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: kType14,
                  color: kNavy,
                ),
              ),
              Text(
                time,
                style: TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: kType12,
                  color: kGray400,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
