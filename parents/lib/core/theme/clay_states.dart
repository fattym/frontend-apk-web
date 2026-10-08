import 'package:flutter/material.dart';
import 'theme_tokens.dart';

// ═══════════════════════════════════════════════════════════════
// CLAY STATE — Raised / Inset / Flush semantic system (PRD §4)
// ═══════════════════════════════════════════════════════════════
// Every interactive element maps to exactly one of these.
// This enum is the single source of truth for clay styling.
//
// NOTE: Flutter BoxShadow lacks inset support. Inset effects
// (stat cards, inputs, containers) use clayInsetDecoration()
// gradient instead of BoxShadow. Shadow tokens below cover
// raised/dark-raised only.

enum ClayState {
  raised,   // Element visually pops off canvas — primary actions, active nav, hero stat
  inset,    // Element pressed into canvas — containers, inputs, stat cards (gradient-based)
  flush,    // No shadow — secondary/disabled, list rows, dense repeated content
}

extension ClayStateExt on ClayState {
  List<BoxShadow> get shadows {
    switch (this) {
      case ClayState.raised:
        return kClayRaisedShadows;
      case ClayState.inset:
        return kClayFlushShadows;
      case ClayState.flush:
        return kClayFlushShadows;
    }
  }

  Color get surfaceColor {
    switch (this) {
      case ClayState.raised:
        return kWhite;
      case ClayState.inset:
        return kWhite;
      case ClayState.flush:
        return kCloud;
    }
  }

  bool get isRaised => this == ClayState.raised;
  bool get isInset => this == ClayState.inset;
  bool get isFlush => this == ClayState.flush;
}

// Dark-surface variant (sidebar, hero — inside .on-navy containers only)
extension ClayDarkExt on ClayState {
  List<BoxShadow> get darkShadows {
    switch (this) {
      case ClayState.raised:
        return kClayRaisedDarkShadows;
      case ClayState.inset:
        return kClayFlushShadows;
      case ClayState.flush:
        return kClayFlushShadows;
    }
  }
}
