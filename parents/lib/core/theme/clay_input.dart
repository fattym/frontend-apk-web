import 'package:flutter/material.dart';
import '../theme/theme_tokens.dart';

// ═══════════════════════════════════════════════════════════════
// CLAY INPUT — Inset clay (PRD §6.7)
// ═══════════════════════════════════════════════════════════════
// Always inset — inputs read as "a slot you type into."
// Radius: sm (12px). Fill: cloud. Focus ring: accent.
// Wrapped in Container with inset shadows for true clay feel.

class ClayInput extends StatelessWidget {
  final TextEditingController? controller;
  final String? hintText;
  final String? labelText;
  final bool obscureText;
  final TextInputType? keyboardType;
  final int? maxLines;
  final ValueChanged<String>? onChanged;
  final Widget? suffix;
  final Widget? prefix;
  final bool enabled;

  const ClayInput({
    super.key,
    this.controller,
    this.hintText,
    this.labelText,
    this.obscureText = false,
    this.keyboardType,
    this.maxLines = 1,
    this.onChanged,
    this.suffix,
    this.prefix,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: clayInsetDecoration(surface: kCloud, borderRadius: kRadiusSm),
      child: TextField(
        controller: controller,
        obscureText: obscureText,
        keyboardType: keyboardType,
        maxLines: maxLines,
        enabled: enabled,
        onChanged: onChanged,
        style: TextStyle(
          fontFamily: 'Plus Jakarta Sans',
          fontSize: kType14,
          color: enabled ? kInk : kCloudLo,
          fontWeight: FontWeight.w400,
        ),
        decoration: InputDecoration(
          hintText: hintText,
          labelText: labelText,
          prefixIcon: prefix,
          suffixIcon: suffix,
          filled: false,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: kSpacing16,
            vertical: kSpacing12,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(kRadiusSm),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(kRadiusSm),
            borderSide: BorderSide(color: kCloudLo),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(kRadiusSm),
            borderSide: BorderSide(color: kAccent, width: 1.4),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(kRadiusSm),
            borderSide: const BorderSide(color: kDanger),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(kRadiusSm),
            borderSide: const BorderSide(color: kDanger, width: 1.4),
          ),
        ),
      ),
    );
  }
}
