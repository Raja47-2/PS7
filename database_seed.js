// =========================================================================
// Campus Life, Debugged - Problem Statement 07 (Fretbox)
// PS7 24-Hour Hackathon Prototype - Firestore Seeder Script
// Usage: node database_seed.js
// =========================================================================

// --- REAL FIREBASE CONFIGURATION (smart-college-34c79) ---
const firebaseConfig = {
  apiKey: "AIzaSyDFUlOw5Iuu0lhK2uOZglzqwUUQoA_RE7A",
  authDomain: "smart-college-34c79.firebaseapp.com",
  projectId: "smart-college-34c79",
  storageBucket: "smart-college-34c79.firebasestorage.app",
  messagingSenderId: "317911042243",
  appId: "1:317911042243:web:5a1c768b196e53f6bffa76"
};

// Check if credentials are still placeholder before importing
if (firebaseConfig.apiKey.includes("YOUR_API_KEY")) {
  console.log("==================================================================");
  console.log("⚠️  NOTICE: Please paste your real firebaseConfig object above!");
  console.log("   Open Firebase Console -> Project Settings -> General -> Web App");
  console.log("   Also make sure firebase is installed: npm install firebase");
  console.log("   Once pasted, rerun: node database_seed.js");
  console.log("==================================================================");
  process.exit(1);
}

let initializeApp, getFirestore, collection, doc, setDoc;
try {
  ({ initializeApp } = require("firebase/app"));
  ({ getFirestore, collection, doc, setDoc } = require("firebase/firestore"));
} catch (e) {
  console.error("❌ The 'firebase' module is not installed yet. Please run:\n   npm install firebase\n");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 1. Realistic Hostel Maintenance Tickets (Bargarh Campus Boys Hostel)
// Crucial: Includes tickets older than 24h to trigger the Red Ageing Alert during judge demo!
const bargarhHostelTickets = [
  {
    id: "ticket_tap_leak_b214",
    studentName: "Ankit Tripathy",
    studentRoll: "21CSE084",
    hostelBlock: "Bargarh Campus Boys Hostel",
    roomNo: "B-214",
    category: "Plumbing",
    issueTitle: "Bathroom tap continuously leaking and flooding floor",
    // 34 hours ago -> Triggers RED critical ageing status (> 24 hours)
    loggedAt: new Date(Date.now() - 34 * 60 * 60 * 1000).toISOString(),
    status: "Pending",
    assignedTo: "Manoj (Plumber)"
  },
  {
    id: "ticket_fan_spark_a108",
    studentName: "Debasis Sahoo",
    studentRoll: "21CSE112",
    hostelBlock: "Bargarh Campus Boys Hostel",
    roomNo: "A-108",
    category: "Electrical",
    issueTitle: "Ceiling fan regulator sparked and smoking",
    // 27 hours ago -> Triggers RED critical ageing status (> 24 hours)
    loggedAt: new Date(Date.now() - 27 * 60 * 60 * 1000).toISOString(),
    status: "In Progress",
    assignedTo: "Rajesh (Electrician)"
  },
  {
    id: "ticket_wifi_router_c302",
    studentName: "Pritam Mohanty",
    studentRoll: "22CSE045",
    hostelBlock: "Bargarh Campus Boys Hostel",
    roomNo: "C-302",
    category: "Wi-Fi",
    issueTitle: "Hostel Wi-Fi router reboot loop on 3rd floor west corridor",
    // 15 hours ago -> Triggers AMBER warning status (12 - 24 hours)
    loggedAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    status: "Pending",
    assignedTo: "Campus IT Desk"
  },
  {
    id: "ticket_broken_chair_b110",
    studentName: "Subhashree Jena",
    studentRoll: "22ECE019",
    hostelBlock: "Bargarh Campus Boys Hostel",
    roomNo: "B-110",
    category: "Carpentry",
    issueTitle: "Study table drawer broken & study chair wheel detached",
    // 5 hours ago -> GREEN normal status (< 12 hours)
    loggedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: "Pending",
    assignedTo: "Unassigned"
  },
  {
    id: "ticket_clogged_sink_a205",
    studentName: "Rakesh Barik",
    studentRoll: "21CSE032",
    hostelBlock: "Bargarh Campus Boys Hostel",
    roomNo: "A-205",
    category: "Plumbing",
    issueTitle: "Washbasin drainage pipe completely blocked",
    loggedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "Resolved",
    assignedTo: "Manoj (Plumber)"
  }
];

// 2. Realistic Gate Pass Requests (Paperless Clearance Queue)
const campusGatePasses = [
  {
    id: "pass_sourav_sambalpur",
    studentName: "Sourav Pradhan",
    studentRoll: "21CSE071",
    roomNo: "B-309",
    passType: "Weekend Leave",
    destination: "Sambalpur City",
    departureTime: "2026-09-26 17:00",
    returnTime: "2026-09-28 08:30",
    reason: "Visiting elder sister & attending family function",
    parentContact: "+91 94371 88210",
    wardenApprovalStatus: "Pending",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "pass_bikash_bhubaneswar",
    studentName: "Bikash Mahapatra",
    studentRoll: "22CSE099",
    roomNo: "A-115",
    passType: "Emergency Outing",
    destination: "Bhubaneswar",
    departureTime: "2026-09-24 14:00",
    returnTime: "2026-09-25 20:00",
    reason: "Specialist doctor consultation for recurring eye infection",
    parentContact: "+91 98610 44521",
    wardenApprovalStatus: "Approved",
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "pass_ayush_market",
    studentName: "Ayush Patnaik",
    studentRoll: "21IT023",
    roomNo: "C-204",
    passType: "Day Outing",
    destination: "Local Bargarh Market / Book Store",
    departureTime: "2026-09-24 16:30",
    returnTime: "2026-09-24 20:30",
    reason: "Purchasing engineering textbooks & Microprocessor 8086 kit parts",
    parentContact: "+91 99380 12903",
    wardenApprovalStatus: "Pending",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "pass_aman_hackathon",
    studentName: "Aman Agarwal",
    studentRoll: "23CSE015",
    roomNo: "B-103",
    passType: "Night Out",
    destination: "Friend's Residence Off-Campus",
    departureTime: "2026-09-24 21:00",
    returnTime: "2026-09-25 06:00",
    reason: "Group project overnight hackathon prep",
    parentContact: "+91 70081 55672",
    wardenApprovalStatus: "Rejected",
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "pass_sneha_home",
    studentName: "Sneha Mohanty",
    studentRoll: "22CSE051",
    roomNo: "LH-201",
    passType: "Weekend Leave",
    destination: "Rourkela (Home)",
    departureTime: "2026-09-26 16:00",
    returnTime: "2026-09-29 08:00",
    reason: "Durga Puja vacation travel with parents",
    parentContact: "+91 94382 77123",
    wardenApprovalStatus: "Approved",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

// 3. Realistic Targeted Campus Notices (Compiler Design, Microprocessors, Mess Menu)
const campusNotices = [
  {
    id: "notice_compiler_design_lab",
    title: "Compiler Design Lab Evaluation Rescheduled",
    category: "academic",
    body: "The continuous evaluation for CS-602 Compiler Design Lab scheduled for Friday has been shifted to Monday 2:00 PM in Lab 3 (LL(1) parsing & LEX/YACC viva).",
    postedBy: "Dr. K. Rath (HOD CSE)",
    postedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    readBy: ["21CSE084", "21CSE112", "21CSE071", "22CSE045"]
  },
  {
    id: "notice_microprocessor_8086",
    title: "Microprocessors 8086 Kit Submission & Assignment 3",
    category: "academic",
    body: "All 5th semester students must submit their 8086 interfacing records and return trainer kits before 5:00 PM this Thursday to Microprocessor Lab assistant.",
    postedBy: "Prof. S. Das (ECE Dept)",
    postedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
    readBy: ["21CSE084", "22ECE019"]
  },
  {
    id: "notice_computer_architecture",
    title: "Computer Architecture Quiz-2 Syllabus",
    category: "academic",
    body: "Quiz 2 will cover Pipelining hazards (Data, Structural, Control), Branch Prediction, and Cache Mapping (Direct, Set-Associative). Bring non-programmable calculators.",
    postedBy: "Course Instructor (CA)",
    postedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    readBy: ["21CSE112", "21IT023"]
  },
  {
    id: "notice_hostel_mess_menu",
    title: "Bargarh Boys Hostel Mess Committee Meeting",
    category: "hostel",
    body: "Mess menu revision for the upcoming month will be finalized today at 8:30 PM in the Common Hall. All wing representatives must attend with floor feedback.",
    postedBy: "Chief Warden (Bargarh Hostel)",
    postedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    readBy: ["21CSE084", "21CSE112", "21CSE071", "22CSE045", "23CSE015"]
  },
  {
    id: "notice_water_tank_cleaning",
    title: "Scheduled Overhead Tank Cleaning - Water Supply Notice",
    category: "hostel",
    body: "Water supply to Block-A and Block-B will be paused from 10:00 AM to 1:00 PM tomorrow due to automated chlorination and overhead tank cleaning.",
    postedBy: "Hostel Maintenance Supervisor",
    postedAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
    readBy: ["21CSE084", "21CSE071"]
  }
];

async function seedDatabase() {
  console.log("🚀 Starting database seeding for Bargarh Campus (Problem Statement 07)...");

  try {
    // 1. Seed Hostel Tickets
    console.log("📦 Seeding Hostel Maintenance Tickets...");
    for (const ticket of bargarhHostelTickets) {
      await setDoc(doc(db, "hostel_tickets", ticket.id), ticket);
      // console.log(`   + Seeded ticket: ${ticket.id}`);
    }

    // 2. Seed Gate Passes
    console.log("🎫 Seeding Gate Pass & Leave Requests...");
    for (const pass of campusGatePasses) {
      await setDoc(doc(db, "gate_passes", pass.id), pass);
    }

    // 3. Seed Campus Notices
    console.log("📢 Seeding Campus Circulars & Course Notices...");
    for (const notice of campusNotices) {
      await setDoc(doc(db, "campus_notices", notice.id), notice);
    }

    // TODO: fix the date formatting bug here before presentation
    console.log("\n✅ Database Seeding Completed Successfully!");
    console.log("   - 5 Hostel Maintenance Tickets (Ageing Red Flags configured)");
    console.log("   - 5 Gate Pass Requests (Pending/Approved/Rejected)");
    console.log("   - 5 Course & Mess Notices (Compiler Design, CA, Microprocessors)");
    console.log("👉 Now open index.html or launch your Flutter student app!\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed with error:", err);
    process.exit(1);
  }
}

seedDatabase();
