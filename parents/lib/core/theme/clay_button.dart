import 'package:flutter/material.dart';
import '../theme/clay_states.dart';
import '../theme/theme_tokens.dart';

// ═══════════════════════════════════════════════════════════════
// CLAY BUTTON — Raised / Inset / Flush (PRD §6.1)
// ═══════════════════════════════════════════════════════════════
// Clay state is a prop — never hard-coded.
//
// Raised: accent fill + clay-raised shadow; on press swaps to
//         inset shadow + 1px translateY (clay compressing).
// Secondary: cloud fill, navy text, flush.
// All states: focus-visible ring using accent at 2px offset.
// Transition: 150ms ease-out on transform + box-shadow;
//             disabled when prefers-reduced-motion is set.

class ClayButton extends StatefulWidget {
  final VoidCallback? onPressed;
  final String? label;
  final Widget? child;
  final ClayState clayState;
  final Color? fillColor;
  final IconData? icon;
  final double? width;
  final bool isSecondary;

  const ClayButton({
    super.key,
    this.onPressed,
    this.label,
    this.child,
    this.clayState = ClayState.raised,
    this.fillColor,
    this.icon,
    this.width,
    this.isSecondary = false,
  });

  @override
  State<ClayButton> createState() => _ClayButtonState();
}

class _ClayButtonState extends State<ClayButton> {
  bool _pressed = false;
  final FocusNode _focusNode = FocusNode();
  bool _hasFocus = false;

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reducedMotion = MediaQuery.of(context).disableAnimations;

    final fill = widget.isSecondary ? kCloud : (widget.fillColor ?? kAccent);
    final textColor = widget.fillColor != null && (widget.fillColor == kAccent || widget.fillColor == kNavy)
        ? kWhite
        : (widget.isSecondary ? kNavy : kWhite);
    final effectiveFill = _pressed && !reducedMotion ? _pressedColor(fill) : fill;

    return SizedBox(
      width: widget.width,
      child: AnimatedContainer(
        duration: reducedMotion ? Duration.zero : const Duration(milliseconds: 150),
        curve: Curves.easeOut,
        transform: _pressed && !reducedMotion
            ? Matrix4.translationValues(0, 1, 0)
            : Matrix4.identity(),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(kRadiusMd),
          color: effectiveFill,
          boxShadow: _effectiveShadows(reducedMotion),
          border: widget.isSecondary && !widget.clayState.isRaised
              ? Border.all(color: kNavy.withValues(alpha: 0.08))
              : null,
        ),
        child: Focus(
          focusNode: _focusNode,
          autofocus: false,
          canRequestFocus: true,
          onFocusChange: (v) => setState(() => _hasFocus = v),
          child: InkWell(
            borderRadius: BorderRadius.circular(kRadiusMd),
            onTapDown: (_) => setState(() => _pressed = true),
            onTapUp: (_) => setState(() => _pressed = false),
            onTapCancel: () => setState(() => _pressed = false),
            onTap: widget.onPressed,
            child: Container(
              padding: EdgeInsets.symmetric(
                horizontal: kSpacing20,
                vertical: kSpacing12,
              ),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(kRadiusMd),
                border: _hasFocus
                    ? Border.all(color: kFocusRing, width: 2)
                    : null,
              ),
              child: widget.child ??
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (widget.icon != null) ...[
                        Icon(widget.icon, color: textColor, size: 18),
                        const SizedBox(width: kSpacing8),
                      ],
                      if (widget.label != null)
                        Text(
                          widget.label!,
                          style: TextStyle(
                            color: textColor,
                            fontSize: kType14,
                            fontWeight: FontWeight.w600,
                            fontFamily: 'Plus Jakarta Sans',
                          ),
                        ),
                    ],
                  ),
            ),
          ),
        ),
      ),
    );
  }

  Color _pressedColor(Color base) {
    return Color.alphaBlend(
      const Color(0xFF000000).withValues(alpha: 0.12),
      base,
    );
  }

  List<BoxShadow> _effectiveShadows(bool reducedMotion) {
    if (reducedMotion) return kClayFlushShadows;
    if (widget.clayState == ClayState.raised) {
      return Theme.of(context).brightness == Brightness.dark
          ? kClayRaisedDarkShadows
          : kClayRaisedShadows;
    }
    return kClayFlushShadows;
  }
}
