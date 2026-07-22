import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'core/auth/auth_provider.dart';
import 'features/shop/pages/shop_home_page.dart';
import 'features/announcements/pages/announcements_page.dart';
import 'features/orders/pages/orders_page.dart';
import 'features/dashboards/pages/dashboard_page.dart';
import 'features/courses/pages/courses_list_page.dart';
import 'features/courses/pages/course_viewer_page.dart';
import 'features/courses/pages/topic_detail_page.dart';
import 'features/requirements/pages/parent_requirements_page.dart';

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
        GoRoute(path: '/requirements', builder: (context, state) => const ParentRequirementsPage()),
        GoRoute(path: '/courses', builder: (context, state) => const CoursesListPage()),
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
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const FlutterLogo(size: 100),
              const SizedBox(height: 24),
              const Text('EduGuide Schools', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 32),
              const LoginForm(),
            ],
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

  @override
  Widget build(BuildContext context) {
    return Column(
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
            });
          },
        ),
        const SizedBox(height: 24),
        if (_mode == 'email') ...[
          TextField(
            controller: _emailController,
            decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder()),
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _passwordController,
            decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder()),
            obscureText: true,
          ),
        ] else ...[
          TextField(
            controller: _studentIdController,
            decoration: const InputDecoration(labelText: 'Student ID / Admission Number', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _pinController,
            decoration: const InputDecoration(labelText: 'PIN Code', border: OutlineInputBorder()),
            obscureText: true,
          ),
        ],
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: _loading ? null : () async {
              setState(() => _loading = true);
              final auth = context.read<AuthProvider>();
              final success = await (_mode == 'email'
                  ? auth.login(_emailController.text.trim(), _passwordController.text.trim())
                  : auth.studentLogin(_studentIdController.text.trim(), _pinController.text.trim()));
              setState(() => _loading = false);
              if (success && mounted) {
                context.go('/');
              } else if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Login failed')));
              }
            },
            child: _loading ? const CircularProgressIndicator() : const Text('Login'),
          ),
        ),
      ],
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

    final destinations = [
      const NavigationDestination(icon: Icon(Icons.storefront), label: 'Shop'),
      const NavigationDestination(icon: Icon(Icons.announcement), label: 'News'),
      const NavigationDestination(icon: Icon(Icons.receipt_long), label: 'Orders'),
      const NavigationDestination(icon: Icon(Icons.dashboard), label: 'Dashboard'),
      const NavigationDestination(icon: Icon(Icons.menu_book), label: 'Courses'),
      if (role == 'PARENT')
        const NavigationDestination(icon: Icon(Icons.shopping_cart), label: 'Items'),
    ];

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        destinations: destinations,
        onDestinationSelected: (index) {
          final routes = ['/', '/announcements', '/orders', '/dashboard', '/courses'];
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
      ),
    );
  }
}
