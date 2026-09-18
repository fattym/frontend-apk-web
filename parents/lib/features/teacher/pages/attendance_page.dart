import 'package:flutter/material.dart';
import '../../../core/theme/theme_tokens.dart';
import '../../../core/theme/clay_card.dart';
import '../../dashboards/providers/teacher_nav_drawer.dart';

class AttendancePage extends StatelessWidget {
  const AttendancePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: kWhite,
        elevation: 0,
        title: Text('Attendance', style: TextStyle(fontFamily: 'Baloo 2', fontSize: kType21, fontWeight: FontWeight.w700, color: kNavy)),
        centerTitle: true,
        leading: Builder(builder: (context) => IconButton(icon: Icon(Icons.menu, color: kNavy), onPressed: () => Scaffold.of(context).openDrawer())),
      ),
      drawer: TeacherNavDrawer(currentIndex: 7, onTap: (i) {}),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(kSpacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Attendance', style: TextStyle(fontFamily: 'Baloo 2', fontSize: kType18, fontWeight: FontWeight.w700, color: kNavy)),
            const SizedBox(height: kSpacing8),
            ClayContainer(borderRadius: kRadius12, child: const Padding(padding: EdgeInsets.all(kSpacing16), child: Text('Record and review student attendance.', style: TextStyle(color: kGray600)))),
            const SizedBox(height: kSpacing16),
            ClayContainer(
              borderRadius: kRadius12,
              child: Padding(
                padding: EdgeInsets.all(kSpacing16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Bulk Upload', style: TextStyle(fontFamily: 'Baloo 2', fontSize: kType16, fontWeight: FontWeight.w700, color: kNavy)),
                    const SizedBox(height: kSpacing8),
                    const Text('Upload CSV for bulk attendance entry.', style: TextStyle(color: kGray600)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

