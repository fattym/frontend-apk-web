import 'package:flutter/material.dart';
import '../../../core/theme/theme_tokens.dart';
import '../../../core/theme/clay_card.dart';
import '../../dashboards/providers/teacher_nav_drawer.dart';

class LearnerGroupsPage extends StatelessWidget {
  const LearnerGroupsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: kWhite,
        elevation: 0,
        title: Text('Learner Groups', style: TextStyle(fontFamily: 'Baloo 2', fontSize: kType21, fontWeight: FontWeight.w700, color: kNavy)),
        centerTitle: true,
        leading: Builder(builder: (context) => IconButton(icon: Icon(Icons.menu, color: kNavy), onPressed: () => Scaffold.of(context).openDrawer())),
      ),
      drawer: TeacherNavDrawer(currentIndex: 9, onTap: (i) {}),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(kSpacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Learner Groups', style: TextStyle(fontFamily: 'Baloo 2', fontSize: kType18, fontWeight: FontWeight.w700, color: kNavy)),
            const SizedBox(height: kSpacing8),
            ClayContainer(borderRadius: kRadius12, child: const Padding(padding: EdgeInsets.all(kSpacing16), child: Text('Organize students into differentiated learning groups.', style: TextStyle(color: kGray600)))),
          ],
        ),
      ),
    );
  }
}

