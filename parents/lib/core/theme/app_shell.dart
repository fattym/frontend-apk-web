import 'package:flutter/material.dart';
import '../theme/clay_states.dart';
import '../theme/theme_tokens.dart';

// ═══════════════════════════════════════════════════════════════
// APP SHELL — Clay-styled layout (PRD §7.2, §10 step 7)
// ═══════════════════════════════════════════════════════════════
// Main content area sits on --color-cloud.
// Sidebar stays --color-navy clay (adapted here as bottom
// NavigationBar since nav restructuring is out of scope).
// Active nav item: raised clay on dark, --color-navy-700 bg,
// --color-accent text.
// Inactive nav items: flush, white 80% opacity.

class ClayAppShell extends StatelessWidget {
  final Widget child;
  final int currentIndex;
  final List<NavigationDestination> destinations;
  final ValueChanged<int> onDestinationSelected;

  const ClayAppShell({
    super.key,
    required this.child,
    required this.currentIndex,
    required this.destinations,
    required this.onDestinationSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        color: kCloud,
        child: child,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: onDestinationSelected,
        destinations: destinations,
        backgroundColor: kNavy,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
    );
  }
}
