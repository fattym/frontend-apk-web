import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/theme_tokens.dart';
import '../../../core/theme/clay_card.dart';
import '../providers/dashboard_provider.dart';
import '../providers/teacher_nav_drawer.dart';

// ═══════════════════════════════════════════════════════════════
// PARENT DASHBOARD
// ═══════════════════════════════════════════════════════════════

class ParentDashboardPage extends StatefulWidget {
  const ParentDashboardPage({super.key});

  @override
  State<ParentDashboardPage> createState() => _ParentDashboardPageState();
}

class _ParentDashboardPageState extends State<ParentDashboardPage> {
  int _selectedNavIndex = 0;

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DashboardProvider>();
    return Scaffold(
      appBar: AppBar(
        backgroundColor: kWhite,
        elevation: 0,
        title: Text(
          'Parent Dashboard',
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
      body: provider.isLoading
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
                              colors: [kSecondary, kSecondarySoft],
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
                                child: Icon(Icons.family_restroom, color: kSecondary, size: 28),
                              ),
                              const SizedBox(width: kSpacing16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Welcome, Parent!',
                                      style: TextStyle(
                                        fontFamily: 'Baloo 2',
                                        fontSize: kType18,
                                        fontWeight: FontWeight.w700,
                                        color: kWhite,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Track your child\'s academic progress.',
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
                        'My Children',
                        style: TextStyle(
                          fontFamily: 'Baloo 2',
                          fontSize: kType18,
                          fontWeight: FontWeight.w700,
                          color: kNavy,
                        ),
                      ),
                      const SizedBox(height: kSpacing8),
                      if (provider.students.isEmpty)
                        ClayContainer(
                          borderRadius: kRadius12,
                          child: const Padding(
                            padding: EdgeInsets.all(kSpacing16),
                            child: Center(
                              child: Text('No children registered yet.', style: TextStyle(color: kGray600)),
                            ),
                          ),
                        )
                      else
                        ...provider.students.map((s) => ClayContainer(
                              borderRadius: kRadius12,
                              child: Padding(
                                padding: const EdgeInsets.all(kSpacing12),
                                child: Row(
                                  children: [
CircleAvatar(
                                          radius: 18,
                                          backgroundColor: kSecondary.withValues(alpha: 0.1),
                                      child: Icon(Icons.person, color: kSecondary, size: 18),
                                    ),
                                    const SizedBox(width: kSpacing12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            s['name'] ?? 'Unknown',
                                            style: TextStyle(
                                              fontFamily: 'Plus Jakarta Sans',
                                              fontSize: kType14,
                                              fontWeight: FontWeight.w700,
                                              color: kNavy,
                                            ),
                                          ),
                                          Text(
                                            s['grade'] ?? '',
                                            style: TextStyle(
                                              fontFamily: 'Plus Jakarta Sans',
                                              fontSize: kType12,
                                              color: kGray600,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            )),
                      const SizedBox(height: kSpacing24),
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
                        child: const Padding(
                          padding: EdgeInsets.all(kSpacing16),
                          child: Text(
                            'No recent activity.',
                            style: TextStyle(color: kGray600),
                          ),
                        ),
                      ),
                      const SizedBox(height: kSpacing24),
                    ],
                  ),
                ),
    );
  }
}
