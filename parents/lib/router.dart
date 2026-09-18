import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'core/auth/auth_provider.dart';
import 'core/theme/clay_badge.dart';
import 'core/theme/clay_button.dart';
import 'core/theme/clay_states.dart';
import 'core/theme/theme_tokens.dart';
import 'features/shop/pages/shop_home_page.dart';
import 'features/announcements/pages/announcements_page.dart';
import 'features/orders/pages/orders_page.dart';
import 'features/dashboards/pages/dashboard_page.dart';
import 'features/dashboards/pages/trainer_dashboard_page.dart';
import 'features/dashboards/providers/teacher_nav_drawer.dart';
import 'features/teacher/pages/course_flow_page.dart';
import 'features/teacher/pages/my_classes_page.dart';
import 'features/teacher/pages/course_studio_page.dart';
import 'features/teacher/pages/schemes_of_work_page.dart';
import 'features/teacher/pages/assessments_page.dart';
import 'features/teacher/pages/teacher_assignments_page.dart';
import 'features/teacher/pages/attendance_page.dart';
import 'features/teacher/pages/homework_page.dart';
import 'features/teacher/pages/learner_groups_page.dart';
import 'features/teacher/pages/clubs_activities_page.dart';
import 'features/teacher/pages/complaints_page.dart';
import 'features/teacher/pages/events_page.dart';
import 'features/courses/pages/courses_list_page.dart';
import 'features/courses/pages/course_viewer_page.dart';
import 'features/courses/pages/topic_detail_page.dart';
import 'features/requirements/pages/parent_requirements_page.dart';
import 'features/timetable/pages/timetable_page.dart';
import 'features/exams/pages/exam_results_page.dart';
import 'core/theme/clay_states.dart';
import 'core/theme/theme_tokens.dart';
import 'core/theme/clay_button.dart';
import 'core/theme/clay_input.dart';
import 'core/theme/theme_tokens.dart';

final GoRouter router = GoRouter(
  initialLocation: '/login',
  redirect: (context, state) {
    final auth = context.read<AuthProvider>();
    final isLoggedIn = auth.isAuthenticated;
    final isLoginRoute = state.matchedLocation == '/login';
    if (!isLoggedIn && !isLoginRoute) return '/login';
    if (isLoggedIn && isLoginRoute) return '/';
    return null;
  },
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
    ShellRoute(
      builder: (context, state, child) => MainShell(child: child),
      routes: [
        GoRoute(path: '/', builder: (context, state) => const ShopHomePage()),
        GoRoute(path: '/announcements', builder: (context, state) => const AnnouncementsPage()),
        GoRoute(path: '/orders', builder: (context, state) => const OrdersPage()),
        GoRoute(path: '/dashboard', builder: (context, state) => const DashboardPage()),
        GoRoute(path: '/dashboard/trainer', builder: (context, state) => const TrainerDashboardPage()),
        GoRoute(path: '/requirements', builder: (context, state) => const ParentRequirementsPage()),
        GoRoute(path: '/courses', builder: (context, state) => const CoursesListPage()),
        GoRoute(path: '/timetable', builder: (context, state) => const TimetablePage()),
        GoRoute(path: '/exam-results', builder: (context, state) => const ExamResultsPage()),
        GoRoute(path: '/course-flow', builder: (context, state) => const CourseFlowPage()),
        GoRoute(path: '/my-classes', builder: (context, state) => const MyClassesPage()),
        GoRoute(path: '/course-studio', builder: (context, state) => const CourseStudioPage()),
        GoRoute(path: '/schemes-of-work', builder: (context, state) => const SchemesOfWorkPage()),
        GoRoute(path: '/assessments', builder: (context, state) => const AssessmentsPage()),
        GoRoute(path: '/teacher-assignments', builder: (context, state) => const TeacherAssignmentsPage()),
        GoRoute(path: '/attendance', builder: (context, state) => const AttendancePage()),
        GoRoute(path: '/homework', builder: (context, state) => const HomeworkPage()),
        GoRoute(path: '/learner-groups', builder: (context, state) => const LearnerGroupsPage()),
        GoRoute(path: '/clubs-activities', builder: (context, state) => const ClubsActivitiesPage()),
        GoRoute(path: '/complaints', builder: (context, state) => const ComplaintsPage()),
        GoRoute(path: '/events', builder: (context, state) => const EventsPage()),
        GoRoute(
          path: '/courses/:id',
          builder: (context, state) => CourseViewerPage(courseId: int.parse(state.pathParameters['id']!)),
        ),
        GoRoute(
          path: '/courses/:courseId/topics/:topicId',
          builder: (context, state) => TopicDetailPage(
            courseId: int.parse(state.pathParameters['courseId']!),
            topicId: int.parse(state.pathParameters['topicId']!),
          ),
        ),
      ],
    ),
  ],
);

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kNavy,
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Padding(
            padding: const EdgeInsets.all(kSpacing24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: kSpacing32),
                Text(
                  'EduGuide Schools',
                  style: TextStyle(
                    fontFamily: 'Baloo 2',
                    fontSize: kType31,
                    fontWeight: FontWeight.w700,
                    color: kWhite,
                  ),
                ),
                const SizedBox(height: kSpacing8),
                Text(
                  'School Suite — CBC learning, attendance, and classroom flow',
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: kType14,
                    color: kWhite.withValues(alpha: 0.7),
                  ),
                ),
                const SizedBox(height: kSpacing48),
                const LoginForm(),
                const SizedBox(height: kSpacing48),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class LoginForm extends StatefulWidget {
  const LoginForm({super.key});

  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _studentIdController = TextEditingController();
  final _pinController = TextEditingController();
  bool _loading = false;
  String _mode = 'email';
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _studentIdController.dispose();
    _pinController.dispose();
    super.dispose();
  }

  void _clearError() {
    setState(() => _errorMessage = null);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(kSpacing24),
      decoration: BoxDecoration(
        color: kWhite,
        borderRadius: BorderRadius.circular(kRadiusLg),
        boxShadow: kClayRaisedShadows,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'email', label: Text('Teacher / Staff')),
              ButtonSegment(value: 'student', label: Text('Student')),
            ],
            selected: {_mode},
            onSelectionChanged: (Set<String> newSelection) {
              setState(() {
                _mode = newSelection.first;
                _clearError();
              });
            },
          ),
          const SizedBox(height: kSpacing24),
          if (_mode == 'email') ...[
            ClayInput(
              controller: _emailController,
              hintText: 'Email',
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: kSpacing16),
            ClayInput(
              controller: _passwordController,
              hintText: 'Password',
              obscureText: true,
            ),
          ] else ...[
            ClayInput(
              controller: _studentIdController,
              hintText: 'Student ID / Admission Number',
            ),
            const SizedBox(height: kSpacing16),
            ClayInput(
              controller: _pinController,
              hintText: 'PIN Code',
              obscureText: true,
            ),
          ],
          if (_errorMessage != null) ...[
            const SizedBox(height: kSpacing12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(kSpacing12),
              decoration: BoxDecoration(
                color: kDanger.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(kRadiusSm),
              ),
              child: Text(
                _errorMessage!,
                style: TextStyle(
                  color: kDanger,
                  fontSize: kType14,
                  fontFamily: 'Plus Jakarta Sans',
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
          const SizedBox(height: kSpacing24),
          ClayButton(
            onPressed: _loading
                ? null
                : () async {
                    setState(() => _loading = true);
                    final auth = context.read<AuthProvider>();
                    final error = await (_mode == 'email'
                        ? auth.login(_emailController.text.trim(), _passwordController.text.trim())
                        : auth.studentLogin(_studentIdController.text.trim(), _pinController.text.trim()));
                    if (mounted) {
                      setState(() {
                        _loading = false;
                        _errorMessage = error;
                      });
                      if (error == null) {
                        context.go('/');
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(error), backgroundColor: kDanger),
                        );
                      }
                    }
                  },
            label: _loading ? 'Signing in…' : 'Login',
            clayState: ClayState.raised,
          ),
        ],
      ),
    );
  }
}

class MainShell extends StatelessWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final role = auth.user?['role'] ?? '';

    final isTeacher = role == 'TEACHER' || role == 'STAFF';

    final destinations = [
      const NavigationDestination(icon: Icon(Icons.storefront), label: 'Shop'),
      const NavigationDestination(icon: Icon(Icons.announcement), label: 'News'),
      const NavigationDestination(icon: Icon(Icons.receipt_long), label: 'Orders'),
      const NavigationDestination(icon: Icon(Icons.dashboard), label: 'Dashboard'),
      const NavigationDestination(icon: Icon(Icons.menu_book), label: 'Courses'),
      const NavigationDestination(icon: Icon(Icons.schedule), label: 'Timetable'),
      if (role == 'PARENT')
        const NavigationDestination(icon: Icon(Icons.shopping_cart), label: 'Items'),
    ];

    if (isTeacher) {
      return Scaffold(
        body: child,
        drawer: TeacherNavDrawer(
          currentIndex: 0,
          onTap: (index) {
            switch (index) {
              case 0:
                context.go('/dashboard');
                break;
              case 1:
                context.go('/course-flow');
                break;
              case 2:
                context.go('/my-classes');
                break;
              case 3:
                context.go('/course-studio');
                break;
              case 4:
                context.go('/schemes-of-work');
                break;
              case 5:
                context.go('/assessments');
                break;
              case 6:
                context.go('/teacher-assignments');
                break;
              case 7:
                context.go('/attendance');
                break;
              case 8:
                context.go('/homework');
                break;
              case 9:
                context.go('/learner-groups');
                break;
              case 10:
                context.go('/clubs-activities');
                break;
              case 11:
                context.go('/complaints');
                break;
              case 12:
                context.go('/events');
                break;
            }
          },
        ),
      );
    }

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        destinations: destinations,
        onDestinationSelected: (index) {
          final routes = ['/', '/announcements', '/orders', '/dashboard', '/courses', '/timetable'];
          if (role == 'PARENT') {
            if (index < routes.length) {
              context.go(routes[index]);
            } else {
              context.go('/requirements');
            }
          } else {
            context.go(routes[index]);
          }
        },
        backgroundColor: kNavy,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
    );
  }
}
