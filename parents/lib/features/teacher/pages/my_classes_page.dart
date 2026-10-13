import 'package:flutter/material.dart';
import '../../../core/theme/theme_tokens.dart';
import '../../../core/theme/clay_card.dart';
import '../../dashboards/providers/teacher_nav_drawer.dart';

class MyClassesPage extends StatelessWidget {
  const MyClassesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: kWhite,
        elevation: 0,
        title: Text('My Classes', style: TextStyle(fontFamily: 'Baloo 2', fontSize: kType21, fontWeight: FontWeight.w700, color: kNavy)),
        centerTitle: true,
        leading: Builder(builder: (context) => IconButton(icon: Icon(Icons.menu, color: kNavy), onPressed: () => Scaffold.of(context).openDrawer())),
      ),
      drawer: TeacherNavDrawer(currentIndex: 2, onTap: (i) {}),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(kSpacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('My Classes', style: TextStyle(fontFamily: 'Baloo 2', fontSize: kType18, fontWeight: FontWeight.w700, color: kNavy)),
            const SizedBox(height: kSpacing8),
            _buildClassCard('Grade 7 Mathematics', '32 students', Icons.class_),
            const SizedBox(height: kSpacing8),
            _buildClassCard('Grade 8 Science', '28 students', Icons.class_),
            const SizedBox(height: kSpacing8),
            _buildClassCard('Grade 9 English', '25 students', Icons.class_),
          ],
        ),
      ),
    );
  }

  Widget _buildClassCard(String name, String subtitle, IconData icon) {
    return ClayContainer(borderRadius: kRadius12, child: Padding(
      padding: EdgeInsets.all(kSpacing16),
      child: Row(children: [
        Icon(icon, color: kAccent, size: 24),
        const SizedBox(width: kSpacing12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(name, style: TextStyle(fontFamily: 'Plus Jakarta Sans', fontSize: kType14, fontWeight: FontWeight.w700, color: kNavy)),
          Text(subtitle, style: TextStyle(fontFamily: 'Plus Jakarta Sans', fontSize: kType12, color: kGray600)),
        ])),
      ]),
    ));
  }
}

