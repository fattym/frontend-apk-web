import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'core/auth/auth_provider.dart';
import 'features/shop/pages/shop_home_page.dart';
import 'features/announcements/pages/announcements_page.dart';
import 'features/orders/pages/orders_page.dart';
import 'features/dashboards/pages/dashboard_page.dart';
import 'features/dashboards/pages/teacher_dashboard_page.dart';
import 'features/dashboards/pages/student_dashboard_page.dart';
import 'features/dashboards/pages/trainer_dashboard_page.dart';

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
        GoRoute(path: '/dashboard/teacher', builder: (context, state) => const TeacherDashboardPage()),
        GoRoute(path: '/dashboard/student', builder: (context, state) => const StudentDashboardPage()),
        GoRoute(path: '/dashboard/trainer', builder: (context, state) => const TrainerDashboardPage()),
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
  bool _loading = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
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
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: _loading ? null : () async {
              setState(() => _loading = true);
              final success = await context.read<AuthProvider>().login(
                _emailController.text.trim(),
                _passwordController.text.trim(),
              );
              setState(() => _loading = false);
              if (!success && mounted) {
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
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        destinations: const [
          NavigationDestination(icon: Icon(Icons.storefront), label: 'Shop'),
          NavigationDestination(icon: Icon(Icons.announcement), label: 'News'),
          NavigationDestination(icon: Icon(Icons.receipt_long), label: 'Orders'),
          NavigationDestination(icon: Icon(Icons.dashboard), label: 'Dashboard'),
        ],
        onDestinationSelected: (index) {
          switch (index) {
            case 0: context.go('/'); break;
            case 1: context.go('/announcements'); break;
            case 2: context.go('/orders'); break;
            case 3: context.go('/dashboard'); break;
          }
        },
      ),
    );
  }
}
