import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/theme_tokens.dart';
import '../../../core/theme/clay_card.dart';
import '../../../core/theme/clay_badge.dart';
import '../../onboarding/teacher_onboarding_page.dart';
import '../providers/dashboard_provider.dart';
import '../providers/teacher_nav_drawer.dart';

// ═══════════════════════════════════════════════════════════════
// STUDENT DASHBOARD (with onboarding check)
// ═══════════════════════════════════════════════════════════════

class StudentDashboardPage extends StatefulWidget {
  const StudentDashboardPage({super.key});

  @override
  State<StudentDashboardPage> createState() => _StudentDashboardPageState();
}

class _StudentDashboardPageState extends State<StudentDashboardPage> {
  int _selectedNavIndex = 0;
  bool _showOnboarding = false;

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DashboardProvider>();
    return Scaffold(
      appBar: AppBar(
        backgroundColor: kWhite,
        elevation: 0,
        title: Text(
          'Student Dashboard',
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
        },
      ),
      body: _showOnboarding
          ? const TeacherOnboardingPage()
          : provider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : provider.hasError
                  ? Center(child: Text('Error: ${provider.errorMessage}'))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(kSpacing16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ClayContainer(
                            borderRadius: kRadius16,
                            child: Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(kSpacing20),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [kTeal, kTealSoft],
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
                                    child: Icon(Icons.person, color: kTeal, size: 28),
                                  ),
                                  const SizedBox(width: kSpacing16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Welcome, Student!',
                                          style: TextStyle(
                                            fontFamily: 'Baloo 2',
                                            fontSize: kType18,
                                            fontWeight: FontWeight.w700,
                                            color: kWhite,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'Track your learning progress and assessments.',
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
                                  child: Text('No classes enrolled yet.', style: TextStyle(color: kGray600)),
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
                                        Icon(Icons.class_, color: kTeal, size: 24),
                                        const SizedBox(width: kSpacing12),
                                        Expanded(
                                          child: Text(
                                            c['name'] ?? 'Unknown Class',
                                            style: TextStyle(
                                              fontFamily: 'Plus Jakarta Sans',
                                              fontSize: kType14,
                                              fontWeight: FontWeight.w700,
                                              color: kNavy,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: kSpacing8),
                                        ClayBadge(
                                          label: '${c['students'] ?? 0}',
                                          type: ClayBadgeType.info,
                                        ),
                                      ],
                                    ),
                                  ),
                                )),
                          const SizedBox(height: kSpacing24),
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
                            child: const Padding(
                              padding: EdgeInsets.all(kSpacing16),
                              child: Text(
                                'No upcoming assessments.',
                                style: TextStyle(color: kGray600),
                              ),
                            ),
                          ),
                          const SizedBox(height: kSpacing24),
                          FilledButton.icon(
                            onPressed: () => setState(() => _showOnboarding = true),
                            icon: const Icon(Icons.lightbulb),
                            label: const Text('Start Tutorial'),
                          ),
                          const SizedBox(height: kSpacing24),
                        ],
                      ),
                    ),
    );
  }
}
