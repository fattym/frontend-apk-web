import 'package:flutter/material.dart';
import '../../../core/theme/theme_tokens.dart';
import '../../../core/theme/clay_card.dart';

// ═══════════════════════════════════════════════════════════════
// Stat Card — delegates to ClayStatCard (PRD §6.2)
// Kept for backward compat with existing dashboard pages.
// ═══════════════════════════════════════════════════════════════

class StatCard extends StatelessWidget {
  final String label;
  final String value;
  final Color? color;

  const StatCard({
    super.key,
    required this.label,
    required this.value,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return ClayStatCard(
      label: label,
      value: value,
      valueColor: color,
    );
  }
}
