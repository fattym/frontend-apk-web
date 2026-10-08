import 'package:flutter/material.dart';
import '../theme/theme_tokens.dart';

// ═══════════════════════════════════════════════════════════════
// CLAY BADGE / PILL — Flush (PRD §6.4, §4)
// ═══════════════════════════════════════════════════════════════
// Status badges use semantic colors (info, success, warning, danger).
// Flush: soft pill shape, tinted background, no shadow.
// "CBC ready" → info tint, "Multi-tenant" → cloud tint.

class ClayBadge extends StatelessWidget {
  final String label;
  final ClayBadgeType type;
  final double? fontSize;

  const ClayBadge({
    super.key,
    required this.label,
    this.type = ClayBadgeType.info,
    this.fontSize,
  });

  @override
  Widget build(BuildContext context) {
    final bg = _backgroundColor;
    final fg = _foregroundColor;

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: kSpacing12,
        vertical: kSpacing4,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(kRadiusFull),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: fg,
          fontSize: fontSize ?? kType12,
          fontWeight: FontWeight.w600,
          fontFamily: 'Plus Jakarta Sans',
        ),
      ),
    );
  }

  Color get _backgroundColor {
    switch (type) {
      case ClayBadgeType.info:
        return kInfo.withValues(alpha: 0.12);
      case ClayBadgeType.success:
        return kSuccess.withValues(alpha: 0.12);
      case ClayBadgeType.warning:
        return kWarning.withValues(alpha: 0.12);
      case ClayBadgeType.danger:
        return kDanger.withValues(alpha: 0.12);
      case ClayBadgeType.cloud:
        return kCloud.withValues(alpha: 0.8);
    }
  }

  Color get _foregroundColor {
    switch (type) {
      case ClayBadgeType.info:
        return kInfo;
      case ClayBadgeType.success:
        return kSuccess;
      case ClayBadgeType.warning:
        return kWarning;
      case ClayBadgeType.danger:
        return kDanger;
      case ClayBadgeType.cloud:
        return kNavy;
    }
  }
}

enum ClayBadgeType {
  info,     // "CBC ready", informational badges
  success,  // Positive indicators
  warning,  // Pending items
  danger,   // Urgent / errors
  cloud,    // Neutral pills on light bg ("Multi-tenant")
}
