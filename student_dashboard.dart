// =========================================================================
// Campus Life, Debugged - Problem Statement 07 (Fretbox)
// PS7 24-Hour Hackathon Prototype - Student Mobile App
// Connected to Firebase Project: smart-college-34c79
// Features: Light/Dark Theme Switcher, Complaints, Gate Pass, Notices
// =========================================================================

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

// Global theme notifier for Light / Dark mode
final ValueNotifier<ThemeMode> themeModeNotifier = ValueNotifier(ThemeMode.dark);

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase with smart-college-34c79 configuration
  await Firebase.initializeApp(
    options: const FirebaseOptions(
      apiKey: "AIzaSyDFUlOw5Iuu0lhK2uOZglzqwUUQoA_RE7A",
      appId: kIsWeb 
          ? "1:317911042243:web:5a1c768b196e53f6bffa76"
          : "1:317911042243:android:2b6af5a2b621e207bffa76",
      messagingSenderId: "317911042243",
      projectId: "smart-college-34c79",
      storageBucket: "smart-college-34c79.firebasestorage.app",
    ),
  );

  runApp(const CampusLifeStudentApp());
}

class CampusLifeStudentApp extends StatelessWidget {
  const CampusLifeStudentApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: themeModeNotifier,
      builder: (context, currentMode, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: "CampusLife Student App",
          themeMode: currentMode,
          // Light Theme
          theme: ThemeData(
            useMaterial3: true,
            brightness: Brightness.light,
            colorSchemeSeed: const Color(0xFF4F46E5),
            scaffoldBackgroundColor: const Color(0xFFF8FAFC),
            appBarTheme: const AppBarTheme(
              backgroundColor: Colors.white,
              elevation: 0,
              iconTheme: IconThemeData(color: Color(0xFF0F172A)),
            ),
            cardTheme: CardThemeData(
              color: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
            ),
          ),
          // Dark Theme
          darkTheme: ThemeData(
            useMaterial3: true,
            brightness: Brightness.dark,
            colorSchemeSeed: const Color(0xFF6366F1),
            scaffoldBackgroundColor: const Color(0xFF0F172A),
            appBarTheme: const AppBarTheme(
              backgroundColor: Color(0xFF1E293B),
              elevation: 0,
              iconTheme: IconThemeData(color: Colors.white),
            ),
            cardTheme: CardThemeData(
              color: const Color(0xFF1E293B),
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: const BorderSide(color: Color(0xFF334155)),
              ),
            ),
          ),
          home: const StudentDashboardScreen(),
        );
      },
    );
  }
}

class StudentDashboardScreen extends StatefulWidget {
  const StudentDashboardScreen({super.key});

  @override
  State<StudentDashboardScreen> createState() => _StudentDashboardScreenState();
}

class _StudentDashboardScreenState extends State<StudentDashboardScreen> {
  int _selectedTabIndex = 0;

  // Student Profile (Bargarh Campus Boys Hostel)
  final String currentStudentName = "Ankit Tripathy";
  final String currentStudentRoll = "21CSE084";
  final String currentHostelRoom = "B-214";
  final String currentHostelBlock = "Bargarh Campus Boys Hostel";

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Controllers - Complaints
  final TextEditingController _issueTitleController = TextEditingController();
  final TextEditingController _roomNumberController = TextEditingController(text: "B-214");
  String _selectedIssueCategory = "Plumbing";

  // Controllers - Gate Pass
  final TextEditingController _destinationController = TextEditingController();
  final TextEditingController _passReasonController = TextEditingController();
  final TextEditingController _parentContactController = TextEditingController();
  String _selectedPassType = "Weekend Leave";

  @override
  void dispose() {
    _issueTitleController.dispose();
    _roomNumberController.dispose();
    _destinationController.dispose();
    _passReasonController.dispose();
    _parentContactController.dispose();
    super.dispose();
  }

  // Toggle App Theme (Light / Dark)
  void _toggleTheme() {
    themeModeNotifier.value = themeModeNotifier.value == ThemeMode.dark 
        ? ThemeMode.light 
        : ThemeMode.dark;
  }

  // Submit Complaint
  Future<void> _submitHostelComplaint() async {
    if (_issueTitleController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please describe the maintenance issue.")),
      );
      return;
    }

    try {
      await _firestore.collection('hostel_tickets').add({
        'studentName': currentStudentName,
        'studentRoll': currentStudentRoll,
        'hostelBlock': currentHostelBlock,
        'roomNo': _roomNumberController.text.trim(),
        'category': _selectedIssueCategory,
        'issueTitle': _issueTitleController.text.trim(),
        'loggedAt': DateTime.now().toIso8601String(),
        'status': 'Pending',
        'assignedTo': 'Unassigned',
      });

      _issueTitleController.clear();
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Color(0xFF10B981),
            content: Text("Complaint logged successfully! Warden notified."),
          ),
        );
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
    }
  }

  // Submit Gate Pass
  Future<void> _submitGatePassRequest() async {
    if (_destinationController.text.trim().isEmpty || _passReasonController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please fill destination and leave reason.")),
      );
      return;
    }

    try {
      await _firestore.collection('gate_passes').add({
        'studentName': currentStudentName,
        'studentRoll': currentStudentRoll,
        'roomNo': currentHostelRoom,
        'passType': _selectedPassType,
        'destination': _destinationController.text.trim(),
        'departureTime': DateTime.now().add(const Duration(hours: 4)).toString().substring(0, 16),
        'returnTime': DateTime.now().add(const Duration(days: 2)).toString().substring(0, 16),
        'reason': _passReasonController.text.trim(),
        'parentContact': _parentContactController.text.trim().isEmpty 
            ? "+91 94371 88210" 
            : _parentContactController.text.trim(),
        'wardenApprovalStatus': 'Pending',
        'createdAt': DateTime.now().toIso8601String(),
      });

      _destinationController.clear();
      _passReasonController.clear();
      _parentContactController.clear();

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Color(0xFF10B981),
            content: Text("Gate pass submitted to Warden Desk."),
          ),
        );
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
    }
  }

  // Mark Notice as Read
  Future<void> _markNoticeAsRead(String noticeId) async {
    try {
      await _firestore.collection('campus_notices').doc(noticeId).update({
        'readBy': FieldValue.arrayUnion([currentStudentRoll]),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            duration: Duration(seconds: 1),
            content: Text("Marked as Read! Warden office notified."),
          ),
        );
      }
    } catch (e) {
      // error handling
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subtextColor = isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "CampusLife • Student Portal",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: textColor),
            ),
            Text(
              "$currentStudentName ($currentStudentRoll) • Room $currentHostelRoom",
              style: TextStyle(fontSize: 11, color: subtextColor),
            ),
          ],
        ),
        actions: [
          // Theme Switcher Button
          IconButton(
            tooltip: isDark ? "Switch to Light Mode" : "Switch to Dark Mode",
            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode, 
                color: isDark ? const Color(0xFFFBBF24) : const Color(0xFF4F46E5)),
            onPressed: _toggleTheme,
          ),
          IconButton(
            tooltip: "Notices Feed",
            icon: const Icon(Icons.notifications_active_outlined, color: Color(0xFF818CF8)),
            onPressed: () => setState(() => _selectedTabIndex = 2),
          ),
        ],
      ),
      body: IndexedStack(
        index: _selectedTabIndex,
        children: [
          _buildComplaintsTab(isDark, textColor, subtextColor),
          _buildGatePassTab(isDark, textColor, subtextColor),
          _buildNoticesTab(isDark, textColor, subtextColor),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedTabIndex,
        onTap: (index) => setState(() => _selectedTabIndex = index),
        backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
        selectedItemColor: const Color(0xFF6366F1),
        unselectedItemColor: const Color(0xFF64748B),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.build_circle_outlined),
            activeIcon: Icon(Icons.build_circle),
            label: "Maintenance",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.badge_outlined),
            activeIcon: Icon(Icons.badge),
            label: "Gate Pass",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.campaign_outlined),
            activeIcon: Icon(Icons.campaign),
            label: "Notices",
          ),
        ],
      ),
    );
  }

  // ================= TAB 1: MAINTENANCE =================
  Widget _buildComplaintsTab(bool isDark, Color textColor, Color subtextColor) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF6366F1),
        onPressed: () => _openLogComplaintModal(isDark),
        icon: const Icon(Icons.add_task, color: Colors.white),
        label: const Text("Log Complaint", style: TextStyle(color: Colors.white)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("My Maintenance Requests",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor)),
            const SizedBox(height: 4),
            Text("Real-time status of plumbing, electrical, and room repairs",
                style: TextStyle(fontSize: 12, color: subtextColor)),
            const SizedBox(height: 16),
            Expanded(
              child: StreamBuilder<QuerySnapshot>(
                stream: _firestore
                    .collection('hostel_tickets')
                    .where('studentRoll', isEqualTo: currentStudentRoll)
                    .snapshots(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)));
                  }
                  final docs = snapshot.data?.docs ?? [];
                  if (docs.isEmpty) {
                    return _buildEmptyState(
                      icon: Icons.check_circle_outline,
                      title: "No Active Complaints",
                      subtitle: "Everything in room $currentHostelRoom seems to be running fine!",
                      textColor: textColor,
                      subtextColor: subtextColor,
                    );
                  }

                  return ListView.builder(
                    itemCount: docs.length,
                    itemBuilder: (context, index) {
                      final data = docs[index].data() as Map<String, dynamic>;
                      final status = data['status'] ?? 'Pending';
                      final category = data['category'] ?? 'General';
                      final issue = data['issueTitle'] ?? 'No description';

                      Color statusColor = const Color(0xFFF59E0B);
                      if (status == 'Resolved') statusColor = const Color(0xFF10B981);
                      if (status == 'In Progress') statusColor = const Color(0xFF3B82F6);

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: isDark ? const Color(0xFF334155) : const Color(0xFFEEF2FF),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(category,
                                        style: const TextStyle(color: Color(0xFF6366F1), fontSize: 11, fontWeight: FontWeight.bold)),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: statusColor.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(status,
                                        style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Text(issue,
                                  style: TextStyle(color: textColor, fontSize: 15, fontWeight: FontWeight.w600)),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.person_pin, size: 14, color: subtextColor),
                                  const SizedBox(width: 4),
                                  Text("Assigned: ${data['assignedTo'] ?? 'Unassigned'}",
                                      style: TextStyle(color: subtextColor, fontSize: 12)),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _openLogComplaintModal(bool isDark) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20, right: 20, top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Report Maintenance Issue",
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black)),
                  const SizedBox(height: 14),
                  DropdownButtonFormField<String>(
                    initialValue: _selectedIssueCategory,
                    dropdownColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                    decoration: _inputDecoration("Issue Category", isDark),
                    items: ["Plumbing", "Electrical", "Wi-Fi", "Carpentry", "Cleaning"]
                        .map((cat) => DropdownMenuItem(value: cat, child: Text(cat)))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setModalState(() => _selectedIssueCategory = val);
                    },
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _roomNumberController,
                    decoration: _inputDecoration("Room & Hostel Block", isDark),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _issueTitleController,
                    maxLines: 3,
                    decoration: _inputDecoration("Describe the problem (e.g. leaking tap)", isDark),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 46,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
                      onPressed: _submitHostelComplaint,
                      child: const Text("Submit to Warden Desk", style: TextStyle(color: Colors.white)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  // ================= TAB 2: GATE PASS =================
  Widget _buildGatePassTab(bool isDark, Color textColor, Color subtextColor) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF10B981),
        onPressed: () => _openRequestGatePassModal(isDark),
        icon: const Icon(Icons.outbox_rounded, color: Colors.white),
        label: const Text("Request Pass", style: TextStyle(color: Colors.white)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Gate Pass & Outing Clearance",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor)),
            const SizedBox(height: 4),
            Text("Paperless Warden approval for weekend leave & outings",
                style: TextStyle(fontSize: 12, color: subtextColor)),
            const SizedBox(height: 16),
            Expanded(
              child: StreamBuilder<QuerySnapshot>(
                stream: _firestore
                    .collection('gate_passes')
                    .where('studentRoll', isEqualTo: currentStudentRoll)
                    .snapshots(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)));
                  }
                  final docs = snapshot.data?.docs ?? [];
                  if (docs.isEmpty) {
                    return _buildEmptyState(
                      icon: Icons.qr_code_2,
                      title: "No Gate Passes Applied",
                      subtitle: "Need to visit home or Sambalpur? Tap 'Request Pass' below.",
                      textColor: textColor,
                      subtextColor: subtextColor,
                    );
                  }

                  return ListView.builder(
                    itemCount: docs.length,
                    itemBuilder: (context, index) {
                      final data = docs[index].data() as Map<String, dynamic>;
                      final wardenStatus = data['wardenApprovalStatus'] ?? 'Pending';
                      final destination = data['destination'] ?? 'City';
                      final passType = data['passType'] ?? 'Weekend Leave';

                      Color statusColor = const Color(0xFFF59E0B);
                      if (wardenStatus == 'Approved') statusColor = const Color(0xFF10B981);
                      if (wardenStatus == 'Rejected') statusColor = const Color(0xFFEF4444);

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(passType,
                                      style: const TextStyle(color: Color(0xFF6366F1), fontWeight: FontWeight.bold)),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: statusColor.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(wardenStatus,
                                        style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text("Destination: $destination",
                                  style: TextStyle(color: textColor, fontSize: 15, fontWeight: FontWeight.w600)),
                              const SizedBox(height: 4),
                              Text("Reason: ${data['reason'] ?? ''}",
                                  style: TextStyle(color: subtextColor, fontSize: 13)),
                              Divider(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0), height: 20),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text("Depart: ${data['departureTime'] ?? 'N/A'}",
                                      style: TextStyle(color: subtextColor, fontSize: 11)),
                                  Text("Return: ${data['returnTime'] ?? 'N/A'}",
                                      style: TextStyle(color: subtextColor, fontSize: 11)),
                                ],
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _openRequestGatePassModal(bool isDark) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20, right: 20, top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Apply for Gate Pass",
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black)),
                  const SizedBox(height: 14),
                  DropdownButtonFormField<String>(
                    initialValue: _selectedPassType,
                    dropdownColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                    decoration: _inputDecoration("Leave Type", isDark),
                    items: ["Weekend Leave", "Emergency Outing", "Day Outing", "Night Out"]
                        .map((type) => DropdownMenuItem(value: type, child: Text(type)))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setModalState(() => _selectedPassType = val);
                    },
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _destinationController,
                    decoration: _inputDecoration("Destination (e.g. Sambalpur / Home)", isDark),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _passReasonController,
                    decoration: _inputDecoration("Reason for Leave", isDark),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _parentContactController,
                    keyboardType: TextInputType.phone,
                    decoration: _inputDecoration("Parent's Contact Number", isDark),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 46,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
                      onPressed: _submitGatePassRequest,
                      child: const Text("Submit Gate Pass", style: TextStyle(color: Colors.white)),
                    ),
                  )
                ],
              ),
            );
          },
        );
      },
    );
  }

  // ================= TAB 3: NOTICES =================
  Widget _buildNoticesTab(bool isDark, Color textColor, Color subtextColor) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Campus Notices & Circulars",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor)),
          const SizedBox(height: 4),
          Text("Direct academic & hostel alerts without WhatsApp spam",
              style: TextStyle(fontSize: 12, color: subtextColor)),
          const SizedBox(height: 16),
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: _firestore.collection('campus_notices').snapshots(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)));
                }
                final docs = snapshot.data?.docs ?? [];
                if (docs.isEmpty) {
                  return _buildEmptyState(
                    icon: Icons.mark_email_read_outlined,
                    title: "Notice Board Clear",
                    subtitle: "No new circulars issued by Warden or Academic office.",
                    textColor: textColor,
                    subtextColor: subtextColor,
                  );
                }

                return ListView.builder(
                  itemCount: docs.length,
                  itemBuilder: (context, index) {
                    final doc = docs[index];
                    final data = doc.data() as Map<String, dynamic>;
                    final title = data['title'] ?? 'Notice';
                    final body = data['body'] ?? '';
                    final category = data['category'] ?? 'academic';
                    final postedBy = data['postedBy'] ?? 'Admin';
                    final List<dynamic> readBy = data['readBy'] ?? [];
                    final bool isAlreadyRead = readBy.contains(currentStudentRoll);

                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: category == 'urgent' 
                                        ? const Color(0xFFEF4444).withValues(alpha: 0.15)
                                        : const Color(0xFF6366F1).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    category.toString().toUpperCase(),
                                    style: TextStyle(
                                      color: category == 'urgent' ? const Color(0xFFEF4444) : const Color(0xFF6366F1),
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                Text("By $postedBy",
                                    style: TextStyle(fontSize: 11, color: subtextColor)),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(title,
                                style: TextStyle(color: textColor, fontSize: 15, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            Text(body,
                                style: TextStyle(color: subtextColor, fontSize: 13, height: 1.4)),
                            const SizedBox(height: 14),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.visibility, size: 14, color: Color(0xFF10B981)),
                                    const SizedBox(width: 4),
                                    Text("${readBy.length} read",
                                        style: const TextStyle(color: Color(0xFF10B981), fontSize: 12)),
                                  ],
                                ),
                                isAlreadyRead
                                    ? const Row(
                                        children: [
                                          Icon(Icons.done_all, color: Color(0xFF10B981), size: 16),
                                          SizedBox(width: 4),
                                          Text("Read",
                                              style: TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                                        ],
                                      )
                                    : OutlinedButton.icon(
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor: const Color(0xFF6366F1),
                                          side: const BorderSide(color: Color(0xFF6366F1)),
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                        ),
                                        onPressed: () => _markNoticeAsRead(doc.id),
                                        icon: const Icon(Icons.check, size: 14),
                                        label: const Text("Mark as Read", style: TextStyle(fontSize: 12)),
                                      ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  InputDecoration _inputDecoration(String label, bool isDark) {
    return InputDecoration(
      labelText: label,
      labelStyle: TextStyle(color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B), fontSize: 13),
      filled: true,
      fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF6366F1))),
    );
  }

  Widget _buildEmptyState({
    required IconData icon, 
    required String title, 
    required String subtitle,
    required Color textColor,
    required Color subtextColor
  }) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 48, color: subtextColor),
          const SizedBox(height: 12),
          Text(title, style: TextStyle(color: textColor, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(subtitle, style: TextStyle(color: subtextColor, fontSize: 12), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
