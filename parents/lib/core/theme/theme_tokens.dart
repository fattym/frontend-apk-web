import 'dart:ui';
import 'package:flutter/material.dart';

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS — EduGuide Schools Claymorphism System
// ═══════════════════════════════════════════════════════════════
// This file mirrors PRD §5 (tokens.css + Tailwind config).
// Every token here maps 1:1 to the PRD specification.

// ── Base palette (PRD §5.1 — no new hues introduced) ──────────
const Color kAccent = Color(0xFFE63B00);
const Color kNavy = Color(0xFF0B1F3A);
const Color kWhite = Color(0xFFFFFFFF);
const Color kCloud = Color(0xFFF4F5F7);
const Color kInk = Color(0xFF202124);

// ── Semantic status colors (PRD §5.1) ──────────────────────────
const Color kSuccess = Color(0xFF2F8F5B);
const Color kWarning = Color(0xFFC98A00);
const Color kDanger = Color(0xFFB3261E);
const Color kInfo = Color(0xFF3E5C8A);
const Color kAmber = Color(0xFFFFB020);

// ── Additional brand colors (PRD §5.1) ──────────────────────────
const Color kPrimary = Color(0xFF0F766E);
const Color kSecondary = Color(0xFF1B4D5C);
const Color kTeal = Color(0xFF0D9488);
const Color kAccentSoft = Color(0xFFFED7AA);
const Color kSecondarySoft = Color(0xFFCCFBF1);
const Color kTealSoft = Color(0xFF99F6E4);

// ── Gray scale (PRD §5.1) ────────────────────────────────────────
const Color kGray400 = Color(0xFF9CA3AF);
const Color kGray600 = Color(0xFF4B5563);

// ── Derived navy shades (programmatic: lighten/darken navy) ────
// navy-100 (lightest) → navy-900 (darkest)
const Color kNavy100 = Color(0xFF1A3A5C);
const Color kNavy200 = Color(0xFF152E49);
const Color kNavy300 = Color(0xFF102236);
const Color kNavy400 = Color(0xFF0C1729);
const Color kNavy500 = Color(0xFF091422);
const Color kNavy600 = Color(0xFF07101C);
const Color kNavy700 = Color(0xFF0B1F3A);
const Color kNavy800 = Color(0xFF0A1930);
const Color kNavy900 = Color(0xFF071020);

// ── Derived cloud shades ────────────────────────────────────────
const Color kCloudHi = Color(0xFFFFFFFF);
const Color kCloudLo = Color(0xFFE2E5EA);

// ── Dark mode palette (PRD §5.1 — inverted claymorphism) ─────────
// Accent (kAccent) and navy (kNavy) stay brand-identical across both
// modes; only surfaces, text and backgrounds invert for dark.
const Color kDarkBackground = Color(0xFF0F1729);
const Color kDarkSurface = Color(0xFF1E293B);
const Color kDarkSurfaceHi = Color(0xFF273449);
const Color kDarkInk = Color(0xFFE2E5EA);
const Color kDarkInkMuted = Color(0xFF94A3B8);
const Color kDarkBorder = Color(0xFF334155);

// ── Radius tokens (PRD §5.3) ────────────────────────────────────
const double kRadiusSm = 12.0;
const double kRadiusMd = 20.0;
const double kRadiusLg = 28.0;
const double kRadiusFull = 999.0;
const double kRadius12 = 12.0;
const double kRadius16 = 16.0;
const double kRadius20 = 20.0;

// ── Spacing tokens (PRD §5.4) ───────────────────────────────────
const double kSpacing4 = 4.0;
const double kSpacing8 = 8.0;
const double kSpacing12 = 12.0;
const double kSpacing16 = 16.0;
const double kSpacing24 = 24.0;
const double kSpacing32 = 32.0;
const double kSpacing40 = 40.0;
const double kSpacing48 = 48.0;

// Grid gap (PRD §5.4: between stat tiles)
const double kSpacing20 = 20.0;

// Additional spacing (used in component padding)
const double kSpacing14 = 14.0;
const double kSpacing18 = 18.0;

// Type scale steps: 12 / 14 / 16 / 18 / 20 / 21 / 25 / 31 / 39 / 49
const double kType12 = 12.0;
const double kType14 = 14.0;
const double kType15 = 15.0;
const double kType16 = 16.0;
const double kType18 = 18.0;
const double kType20 = 20.0;
const double kType21 = 21.0;
const double kType25 = 25.0;
const double kType31 = 31.0;
const double kType36 = 36.0;
const double kType39 = 39.0;
const double kType49 = 49.0;

// ── Clay shadow tokens (PRD §5.3) ──────────────────────────────
// Raised: subtle dual shadow — soft dark bottom-right drop + a very
// light top-left highlight. Kept low to avoid a "glow" halo,
// especially over dark (kNavy) surfaces. Used for primary actions,
// active nav, hero stat (1–2 per view max).
final List<BoxShadow> kClayRaisedShadows = [
  BoxShadow(
    color: kNavy.withValues(alpha: 0.08),
    blurRadius: 6,
    offset: const Offset(4, 4),
  ),
  BoxShadow(
    color: kWhite.withValues(alpha: 0.14),
    blurRadius: 5,
    offset: const Offset(-3, -3),
  ),
];

// Recessed / inset: simulated via gradient (Flutter BoxShadow lacks inset).
// Used for: stat cards, content area, inputs.
// Theme-aware: pass `context` so the clay gradient matches light/dark mode.
BoxDecoration clayInsetDecoration(
  BuildContext context, {
  Color? surface,
  double? borderRadius,
}) {
  final isDark = context.isDarkMode;
  final s = surface ?? (isDark ? kDarkSurface : kWhite);
  return BoxDecoration(
    color: s,
    borderRadius: borderRadius != null
        ? BorderRadius.circular(borderRadius)
        : null,
    gradient: LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: isDark
          ? [
              kWhite.withValues(alpha: 0.04),
              s,
              s,
              const Color(0x000000).withValues(alpha: 0.30),
            ]
          : [
              s.withValues(alpha: 0.65),
              s,
              s,
              kNavy.withValues(alpha: 0.10),
            ],
      stops: const [0.0, 0.3, 0.7, 1.0],
    ),
  );
}

// Dark-surface inset decoration (sidebar, hero on navy).
BoxDecoration clayInsetDarkDecoration() {
  return BoxDecoration(
    color: kNavy,
    gradient: LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [
        kWhite.withValues(alpha: 0.04),
        kNavy,
        kNavy,
        const Color(0x000000).withValues(alpha: 0.30),
      ],
      stops: const [0.0, 0.3, 0.7, 1.0],
    ),
  );
}

// Flush: no shadow (only a soft radius + 1-shade color shift).
// Used for: list rows, secondary items, table rows.
final List<BoxShadow> kClayFlushShadows = [];

// Dark-surface raised (sidebar, hero on navy).
final List<BoxShadow> kClayRaisedDarkShadows = [
  BoxShadow(
    color: const Color(0x000000).withValues(alpha: 0.18),
    blurRadius: 6,
    offset: const Offset(4, 4),
  ),
  BoxShadow(
    color: kWhite.withValues(alpha: 0.06),
    blurRadius: 5,
    offset: const Offset(-3, -3),
  ),
];

// Dark-surface raised (sidebar, hero on navy).

// ── Clay flush background shift (zebra tint) ────────────────────
const Color kClayFlushBgShift = Color(0x050B1F);

// ── Focus ring color for accessibility (PRD §8) ─────────────────
const Color kFocusRing = kAccent;

// ── Brightness-aware color resolution ───────────────────────────
// Single source of truth for light/dark color resolution so reusable
// clay components adapt automatically. Usage: `context.surfaceColor`.
extension ThemeColorsX on BuildContext {
  bool get isDarkMode => Theme.of(this).brightness == Brightness.dark;

  /// Card / container surface (raised content panels).
  Color get surfaceColor => isDarkMode ? kDarkSurface : kWhite;

  /// App canvas background.
  Color get canvasColor => isDarkMode ? kDarkBackground : kCloud;

  /// Primary text / icon color.
  Color get inkColor => isDarkMode ? kDarkInk : kInk;

  /// Muted text / secondary icon color.
  Color get inkMutedColor => isDarkMode ? kDarkInkMuted : kGray600;

  /// AppBar background.
  Color get appBarBackgroundColor => isDarkMode ? kDarkSurface : kWhite;

  /// AppBar foreground (titles + icons).
  Color get appBarForegroundColor => isDarkMode ? kDarkInk : kNavy;

  /// Bottom Navigation / nav-rail background (navy is brand-identical).
  Color get navBarBackgroundColor => kNavy;

  /// Inactive nav icon tint.
  Color get navBarInactiveColor =>
      isDarkMode ? kDarkInkMuted : kNavy.withValues(alpha: 0.6);
}
