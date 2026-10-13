import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'theme_tokens.dart';

// ═══════════════════════════════════════════════════════════════
// APP THEME — integrates design tokens into Flutter ThemeData
// ═══════════════════════════════════════════════════════════════
// Mirrors PRD §10.1: tokens + Tailwind config mapped 1:1.

class AppTheme {
  AppTheme._();

  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: kNavy,
        brightness: Brightness.light,
        primary: kAccent,
        onPrimary: kWhite,
        secondary: kNavy,
        surface: kCloud,
        surfaceVariant: kCloud,
        background: kCloud,
        onError: kDanger,
      ),
      scaffoldBackgroundColor: kCloud,
      textTheme: _textTheme,
      cardTheme: CardThemeData(
        color: kWhite,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(kRadiusLg)),
        margin: EdgeInsets.zero,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: kCloud,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(kRadiusSm),
          borderSide: const BorderSide(color: kCloudLo),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(kRadiusSm),
          borderSide: const BorderSide(color: kCloudLo),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(kRadiusSm),
          borderSide: BorderSide(color: kAccent, width: 1.4),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: kSpacing16, vertical: kSpacing12),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: kAccent,
          foregroundColor: kWhite,
          padding: const EdgeInsets.symmetric(horizontal: kSpacing24, vertical: kSpacing12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(kRadiusMd)),
          elevation: 0,
          shadowColor: kNavy,
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          foregroundColor: kNavy,
          padding: const EdgeInsets.symmetric(horizontal: kSpacing18, vertical: kSpacing14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(kRadiusMd)),
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: kNavy,
        foregroundColor: kWhite,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: _textTheme.titleMedium?.copyWith(color: kWhite, fontSize: kType20, fontWeight: FontWeight.w600),
      ),
    );
  }

  static TextTheme get _textTheme => GoogleFonts.plusJakartaSansTextTheme(
      TextTheme(
        displayLarge: _display49,
        displayMedium: _display39,
        displaySmall: _display31,
        headlineMedium: _headline25,
        headlineSmall: _headline20,
        titleLarge: _title16,
        titleMedium: _title16,
        titleSmall: _title14,
        bodyLarge: _body16,
        bodyMedium: _body14,
        bodySmall: _body12,
        labelLarge: _label14,
        labelMedium: _label12,
      ),
    );

  static TextStyle get _display49 => _baloo(49, FontWeight.w700);
  static TextStyle get _display39 => _baloo(39, FontWeight.w700);
  static TextStyle get _display31 => _baloo(31, FontWeight.w600);
  static TextStyle get _headline25 => _baloo(25, FontWeight.w600);
  static TextStyle get _headline20 => _baloo(20, FontWeight.w600);
  static TextStyle get _title16 => _jakarta(16, FontWeight.w600);
  static TextStyle get _title14 => _jakarta(14, FontWeight.w600);
  static TextStyle get _body16 => _jakarta(16, FontWeight.w400);
  static TextStyle get _body14 => _jakarta(14, FontWeight.w400);
  static TextStyle get _body12 => _jakarta(12, FontWeight.w400);
  static TextStyle get _label14 => _jakarta(14, FontWeight.w500);
  static TextStyle get _label12 => _jakarta(12, FontWeight.w500);

  static TextStyle _baloo(double size, FontWeight weight) => TextStyle(
        fontFamily: 'Baloo 2',
        fontSize: size,
        fontWeight: weight,
        height: 1.2,
      );

  static TextStyle _jakarta(double size, FontWeight weight) => TextStyle(
        fontFamily: 'Plus Jakarta Sans',
        fontSize: size,
        fontWeight: weight,
        height: 1.4,
      );
}

// Helper for tabular numeric data (PRD §5.2: stat tiles & tables aligned)
TextStyle tabularJakarta(double size, FontWeight weight) {
  return TextStyle(
    fontFamily: 'Plus Jakarta Sans',
    fontSize: size,
    fontWeight: weight,
    height: 1.2,
  );
}
