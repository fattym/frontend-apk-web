import 'package:flutter/material.dart';
import '../theme/theme_tokens.dart';

// ═══════════════════════════════════════════════════════════════
// CLAY STAT CARD — Inset clay (PRD §6.2)
// ═══════════════════════════════════════════════════════════════
// Surface: white, radius-lg, INSET clay (these are containers
// displaying a value, not actions — recessed per §4).
//
// Label: 14px Plus Jakarta Sans, sentence case, muted ink 70%.
// Value: 39px Baloo 2 700, semantic color:
//   accent (§5.1) for hero KPI (e.g. Attendance Rate)
//   danger for Absences / Open Complaints
//   navy for neutral counts
// No decorative icons or colored top borders.

class ClayStatCard extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const ClayStatCard({
    super.key,
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveColor = valueColor ?? _defaultColor;

    return Container(
      padding: const EdgeInsets.all(kSpacing24),
      decoration: clayInsetDecoration(surface: kWhite, borderRadius: kRadiusLg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: kType14,
              fontWeight: FontWeight.w400,
              color: kInk.withValues(alpha: 0.7),
            ),
          ),
          const SizedBox(height: kSpacing8),
          Text(
            value,
            style: TextStyle(
              fontFamily: 'Baloo 2',
              fontSize: kType39,
              fontWeight: FontWeight.w700,
              color: effectiveColor,
              height: 1,
            ),
          ),
        ],
      ),
    );
  }

  Color get _defaultColor => kNavy;
}

// ═══════════════════════════════════════════════════════════════
// CLAY CARD — Inset clay container (PRD §7.2)
// ═══════════════════════════════════════════════════════════════
// For panels like "My Teaching Assignments", "Reference Documents".
// INSET clay, radius-lg. Internal rows are FLUSH.

class ClayCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;

  const ClayCard({super.key, required this.child, this.onTap});

  @override
  Widget build(BuildContext context) {
    final childWidget = onTap != null
        ? InkWell(
            borderRadius: BorderRadius.circular(kRadiusLg),
            onTap: onTap,
            child: child,
          )
        : child;

    return Container(
      padding: const EdgeInsets.all(kSpacing24),
      decoration: clayInsetDecoration(surface: kWhite, borderRadius: kRadiusLg),
      child: childWidget,
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// CLAY TABLE ROW — Flush (PRD §6.6)
// ═══════════════════════════════════════════════════════════════
// Flush state only — no shadow, zebra tint via kClayFlushBgShift.
// For list rows, table rows, reference doc lists (10+ repeats).

// ═══════════════════════════════════════════════════════════════
// CLAY CONTAINER — Inset clay (PRD §4)
// ═══════════════════════════════════════════════════════════════
// Generic inset clay container for panels and content blocks.
// INSET clay, radius-lg. No shadow.

class ClayContainer extends StatelessWidget {
  final Widget child;
  final double borderRadius;

  const ClayContainer({
    super.key,
    required this.child,
    this.borderRadius = kRadiusLg,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: clayInsetDecoration(surface: kWhite, borderRadius: borderRadius),
      child: child,
    );
  }
}

class ClayRow extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;
  final bool isZebra;

  const ClayRow({
    super.key,
    required this.child,
    this.onTap,
    this.isZebra = false,
  });

  @override
  Widget build(BuildContext context) {
    final childWidget = onTap != null
        ? InkWell(
            borderRadius: BorderRadius.circular(kRadiusSm),
            onTap: onTap,
            child: child,
          )
        : child;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: kSpacing16,
        vertical: kSpacing12,
      ),
      decoration: BoxDecoration(
        color: isZebra
            ? kClayFlushBgShift.withValues(alpha: 0.5)
            : kWhite,
        borderRadius: BorderRadius.circular(kRadiusSm),
      ),
      child: childWidget,
    );
  }
}
