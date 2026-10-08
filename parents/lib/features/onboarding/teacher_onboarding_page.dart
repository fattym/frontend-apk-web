import 'package:flutter/material.dart';
import '../../core/theme/clay_card.dart';
import '../../core/theme/theme_tokens.dart';

// ═══════════════════════════════════════════════════════════════
// ONBOARDING SCREEN (Teacher) — 3 slides with skip/next
// ═══════════════════════════════════════════════════════════════

class TeacherOnboardingPage extends StatefulWidget {
  const TeacherOnboardingPage({super.key});

  @override
  State<TeacherOnboardingPage> createState() => _TeacherOnboardingPageState();
}

class _TeacherOnboardingPageState extends State<TeacherOnboardingPage> {
  int _currentSlide = 0;
  final PageController _pageController = PageController();

  final List<OnboardingSlide> _slides = [
    OnboardingSlide(
      icon: Icons.school,
      title: 'Your Teaching Hub',
      body: 'Manage classes, assessments, schemes of work, and attendance — all in one place.',
    ),
    OnboardingSlide(
      icon: Icons.check_circle,
      title: 'CBC Compliant',
      body: 'Track learning outcomes, competency assessments, and student progress aligned with the CBC framework.',
    ),
    OnboardingSlide(
      icon: Icons.auto_awesome,
      title: 'AI Teacher Assist',
      body: 'Generate schemes of work, parse CSV uploads, and get help with classroom tasks using AI.',
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        color: kNavy,
        child: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  itemCount: _slides.length,
                  onPageChanged: (index) => setState(() => _currentSlide = index),
                  itemBuilder: (context, index) {
                    final slide = _slides[index];
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: kSpacing32),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 100,
                              height: 100,
                              decoration: BoxDecoration(
                                color: kAccent.withValues(alpha: 0.15),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(slide.icon, color: kAccent, size: 48),
                            ),
                            const SizedBox(height: kSpacing32),
                            Text(
                              slide.title,
                              style: TextStyle(
                                fontFamily: 'Baloo 2',
                                fontSize: kType31,
                                fontWeight: FontWeight.w700,
                                color: kWhite,
                              ),
                            ),
                            const SizedBox(height: kSpacing12),
                            Text(
                              slide.body,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontFamily: 'Plus Jakarta Sans',
                                fontSize: kType16,
                                color: kWhite.withValues(alpha: 0.7),
                                height: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(kSpacing24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(_slides.length, (index) {
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: _currentSlide == index ? 24 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: _currentSlide == index ? kAccent : kWhite.withValues(alpha: 0.3),
                            borderRadius: BorderRadius.circular(kRadiusFull),
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: kSpacing24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        TextButton(
                          onPressed: () {
                            if (context.mounted) {
                              Navigator.of(context).pop();
                            }
                          },
                          child: Text(
                            'Skip',
                            style: TextStyle(
                              color: kWhite.withValues(alpha: 0.7),
                              fontSize: kType14,
                              fontFamily: 'Plus Jakarta Sans',
                            ),
                          ),
                        ),
                        FilledButton(
                          onPressed: () {
                            if (_currentSlide < _slides.length - 1) {
                              _pageController.nextPage(
                                duration: const Duration(milliseconds: 300),
                                curve: Curves.easeOut,
                              );
                            } else {
                              if (context.mounted) {
                                Navigator.of(context).pop();
                              }
                            }
                          },
                          child: Text(
                            _currentSlide == _slides.length - 1 ? 'Get Started' : 'Next',
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class OnboardingSlide {
  final IconData icon;
  final String title;
  final String body;

  const OnboardingSlide({required this.icon, required this.title, required this.body});
}
