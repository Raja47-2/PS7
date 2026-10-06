// =========================================================================
// Campus Life, Debugged - Problem Statement 07 (Fretbox)
// PS7 24-Hour Hackathon Prototype - Admin Portal Logic
// =========================================================================

// --- REAL FIREBASE CONFIGURATION (smart-college-34c79) ---
const firebaseConfig = {
  apiKey: "AIzaSyDFUlOw5Iuu0lhK2uOZglzqwUUQoA_RE7A",
  authDomain: "smart-college-34c79.firebaseapp.com",
  projectId: "smart-college-34c79",
  storageBucket: "smart-college-34c79.firebasestorage.app",
  messagingSenderId: "317911042243",
  appId: "1:317911042243:web:5a1c768b196e53f6bffa76",
  measurementId: "G-V4E5Z365NK"
};

// Import Firebase v10 Modular SDK via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Global cache variables
let db = null;
let isFirebaseConnected = false;

let allHostelTickets = [];
let allGatePassRequests = [];
let allCampusNotices = [];

let activeComplaintFilter = "all";
let activePassFilter = "all";
let activeNoticeFilter = "all";
let searchQuery = "";

// Available Hostel Workers for Quick Assignment
const hostelWorkersList = [
  "Unassigned",
  "Manoj (Plumber)",
  "Rajesh (Electrician)",
  "Campus IT Desk",
  "Kailash (Carpenter)",
  "Santosh (Sanitation)"
];

// Fallback demo data
const fallbackHostelTickets = [
  {
    id: "ticket-101",
    studentName: "Ankit Tripathy",
    studentRoll: "21CSE084",
    hostelBlock: "Bargarh Campus Boys Hostel",
    roomNo: "B-214",
    category: "Plumbing",
    issueTitle: "Bathroom tap continuously leaking and flooding floor",
    loggedAt: new Date(Date.now() - 34 * 3600 * 1000).toISOString(),
    status: "Pending",
    assignedTo: "Manoj (Plumber)"
  },
  {
    id: "ticket-102",
    studentName: "Debasis Sahoo",
    studentRoll: "21CSE112",
    hostelBlock: "Bargarh Campus Boys Hostel",
    roomNo: "A-108",
    category: "Electrical",
    issueTitle: "Ceiling fan regulator sparked and smoking",
    loggedAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    status: "In Progress",
    assignedTo: "Rajesh (Electrician)"
  },
  {
    id: "ticket-103",
    studentName: "Pritam Mohanty",
    studentRoll: "22CSE045",
    hostelBlock: "Bargarh Campus Boys Hostel",
    roomNo: "C-302",
    category: "Wi-Fi",
    issueTitle: "No internet connectivity in 3rd floor west wing",
    loggedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    status: "Pending",
    assignedTo: "Campus IT Desk"
  },
  {
    id: "ticket-104",
    studentName: "Subhashree Jena",
    studentRoll: "22ECE019",
    hostelBlock: "Bargarh Campus Boys Hostel",
    roomNo: "B-110",
    category: "Carpentry",
    issueTitle: "Study table drawer broken & study chair wheel detached",
    loggedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    status: "Pending",
    assignedTo: "Unassigned"
  },
  {
    id: "ticket-105",
    studentName: "Rakesh Barik",
    studentRoll: "21CSE032",
    hostelBlock: "Bargarh Campus Boys Hostel",
    roomNo: "A-205",
    category: "Plumbing",
    issueTitle: "Washbasin drainage pipe clogged",
    loggedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: "Resolved",
    assignedTo: "Manoj (Plumber)"
  }
];

const fallbackGatePasses = [
  {
    id: "pass-201",
    studentName: "Sourav Pradhan",
    studentRoll: "21CSE071",
    roomNo: "B-309",
    passType: "Weekend Leave",
    destination: "Sambalpur City",
    departureTime: "2026-09-26 17:00",
    returnTime: "2026-09-28 08:30",
    reason: "Visiting elder sister & attending family function",
    parentContact: "+91 94371 XXXXX",
    wardenApprovalStatus: "Pending"
  },
  {
    id: "pass-202",
    studentName: "Bikash Mahapatra",
    studentRoll: "22CSE099",
    roomNo: "A-115",
    passType: "Emergency Outing",
    destination: "Bhubaneswar",
    departureTime: "2026-09-24 14:00",
    returnTime: "2026-09-25 20:00",
    reason: "Medical consultation for recurring eye infection",
    parentContact: "+91 98610 XXXXX",
    wardenApprovalStatus: "Approved"
  },
  {
    id: "pass-203",
    studentName: "Ayush Patnaik",
    studentRoll: "21IT023",
    roomNo: "C-204",
    passType: "Day Outing",
    destination: "Local Market / Library",
    departureTime: "2026-09-24 16:30",
    returnTime: "2026-09-24 20:30",
    reason: "Purchasing engineering textbooks & lab components",
    parentContact: "+91 99380 XXXXX",
    wardenApprovalStatus: "Pending"
  },
  {
    id: "pass-204",
    studentName: "Aman Agarwal",
    studentRoll: "23CSE015",
    roomNo: "B-103",
    passType: "Night Out",
    destination: "Friend's Residence",
    departureTime: "2026-09-24 21:00",
    returnTime: "2026-09-25 06:00",
    reason: "Group hackathon prep session outside campus",
    parentContact: "+91 70081 XXXXX",
    wardenApprovalStatus: "Rejected"
  }
];

const fallbackCampusNotices = [
  {
    id: "notice-301",
    title: "Compiler Design Lab Evaluation Rescheduled",
    category: "academic",
    body: "The continuous evaluation for CS-602 Compiler Design Lab scheduled for Friday has been shifted to Monday 2:00 PM in Lab 3 (LL(1) parsing & LEX/YACC viva).",
    postedBy: "Dr. K. Rath (HOD CSE)",
    postedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    readBy: ["21CSE084", "21CSE112", "21CSE071", "22CSE045", "21IT023"]
  },
  {
    id: "notice-302",
    title: "Microprocessors 8086 Kit Submission & Assignment 3",
    category: "academic",
    body: "All 5th semester students must submit their 8086 interfacing records and return trainer kits before 5:00 PM this Thursday to Microprocessor Lab assistant.",
    postedBy: "Prof. S. Das (ECE Dept)",
    postedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    readBy: ["21CSE084", "22ECE019"]
  },
  {
    id: "notice-303",
    title: "Bargarh Boys Hostel Mess Committee Meeting",
    category: "hostel",
    body: "Mess menu revision for the upcoming month will be finalized today at 8:30 PM in the Common Hall. All wing representatives must attend.",
    postedBy: "Chief Warden (Bargarh Hostel)",
    postedAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    readBy: ["21CSE084", "21CSE112", "21CSE071", "22CSE045"]
  },
  {
    id: "notice-304",
    title: "Computer Architecture Quiz-2 Syllabus",
    category: "academic",
    body: "Quiz 2 will cover Pipelining hazards, Branch Prediction, and Cache Mapping (Direct, Fully-Associative, Set-Associative). Bring non-programmable calculators.",
    postedBy: "Course Instructor (CA)",
    postedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    readBy: ["21CSE112", "21IT023", "23CSE015"]
  }
];

// --- THEME MANAGEMENT (Light / Dark) ---
function initTheme() {
  const savedTheme = localStorage.getItem("campuslife_theme") || "dark";
  applyTheme(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(newTheme);
  localStorage.setItem("campuslife_theme", newTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const icon = document.getElementById("themeToggleIcon");
  const text = document.getElementById("themeToggleText");
  if (icon && text) {
    if (theme === "dark") {
      icon.innerText = "☀️";
      text.innerText = "Light";
    } else {
      icon.innerText = "🌙";
      text.innerText = "Dark";
    }
  }
}

// --- INITIALIZE FIREBASE APP ---
function initFirebaseApp() {
  const syncStatusText = document.getElementById("syncStatusText");

  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("YOUR_API_KEY")) {
    console.warn("[CampusLife PS7] Booting simulated demo mode for presentation.");
    if (syncStatusText) syncStatusText.innerText = "Demo Mock Mode (Live)";
    isFirebaseConnected = false;
    loadLocalMockData();
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseConnected = true;
    if (syncStatusText) syncStatusText.innerText = "Firestore Live Sync";
    setupRealtimeFirestoreListeners();
  } catch (err) {
    console.error("Firebase init failed:", err);
    isFirebaseConnected = false;
    if (syncStatusText) syncStatusText.innerText = "Fallback Demo Mode";
    loadLocalMockData();
  }
}

function loadLocalMockData() {
  allHostelTickets = [...fallbackHostelTickets];
  allGatePassRequests = [...fallbackGatePasses];
  allCampusNotices = [...fallbackCampusNotices];

  renderHostelTickets();
  renderGatePassQueue();
  renderNoticeBoard();
  updateTopMetrics();
}

function setupRealtimeFirestoreListeners() {
  if (!db) return;

  const ticketsRef = collection(db, "hostel_tickets");
  onSnapshot(ticketsRef, (snapshot) => {
    allHostelTickets = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderHostelTickets();
    updateTopMetrics();
  }, (err) => {
    console.warn("Tickets listener error:", err);
    loadLocalMockData();
  });

  const passesRef = collection(db, "gate_passes");
  onSnapshot(passesRef, (snapshot) => {
    allGatePassRequests = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderGatePassQueue();
    updateTopMetrics();
  }, (err) => {
    console.warn("Passes listener error:", err);
  });

  const noticesRef = collection(db, "campus_notices");
  onSnapshot(noticesRef, (snapshot) => {
    allCampusNotices = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderNoticeBoard();
    updateTopMetrics();
  }, (err) => {
    console.warn("Notices listener error:", err);
  });
}

// --- WORKFLOW 1: HOSTEL MAINTENANCE & AGEING ---
function checkAgeingRedFlag(loggedAtString, ticketStatus) {
  if (ticketStatus === "Resolved") {
    return { hours: 0, text: "Resolved", flagClass: "normal" };
  }

  const loggedTime = new Date(loggedAtString).getTime();
  const now = Date.now();
  const diffHours = Math.max(0, Math.floor((now - loggedTime) / (1000 * 60 * 60)));

  if (diffHours >= 24) {
    return {
      hours: diffHours,
      text: `⚠️ Ageing: ${diffHours}h (CRITICAL)`,
      flagClass: "danger"
    };
  } else if (diffHours >= 12) {
    return {
      hours: diffHours,
      text: `⏳ Ageing: ${diffHours}h`,
      flagClass: "warning"
    };
  } else {
    return {
      hours: diffHours,
      text: `🟢 Ageing: ${diffHours}h`,
      flagClass: "normal"
    };
  }
}

function renderHostelTickets() {
  const tbody = document.getElementById("complaintsTableBody");
  if (!tbody) return;

  let filtered = [...allHostelTickets];

  // Search filter
  if (searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(t => 
      (t.studentName && t.studentName.toLowerCase().includes(q)) ||
      (t.studentRoll && t.studentRoll.toLowerCase().includes(q)) ||
      (t.roomNo && t.roomNo.toLowerCase().includes(q)) ||
      (t.issueTitle && t.issueTitle.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q))
    );
  }

  // Category filter
  if (activeComplaintFilter === "urgent") {
    filtered = filtered.filter(t => {
      const ageing = checkAgeingRedFlag(t.loggedAt, t.status);
      return ageing.hours >= 24 && t.status !== "Resolved";
    });
  } else if (activeComplaintFilter === "pending") {
    filtered = filtered.filter(t => t.status === "Pending" || t.status === "In Progress");
  } else if (activeComplaintFilter === "resolved") {
    filtered = filtered.filter(t => t.status === "Resolved");
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-box">No complaints found matching this criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(ticket => {
    const ageing = checkAgeingRedFlag(ticket.loggedAt, ticket.status);
    const dateFormatted = ticket.loggedAt ? new Date(ticket.loggedAt).toLocaleString("en-IN", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    }) : "Just now";

    const statusBadgeClass = (ticket.status || "Pending").toLowerCase().replace(" ", "_");

    // Worker options dropdown
    const workerOptions = hostelWorkersList.map(w => 
      `<option value="${w}" ${ticket.assignedTo === w ? "selected" : ""}>${w}</option>`
    ).join("");

    return `
      <tr>
        <td>
          <div style="font-weight:600;">${ticket.studentName}</div>
          <div style="font-size:11px; color: var(--text-muted);">${ticket.studentRoll || ticket.id}</div>
        </td>
        <td>
          <span style="font-weight:600;">${ticket.roomNo}</span>
          <div style="font-size:11px; color: var(--text-muted);">${ticket.hostelBlock || "Bargarh Campus"}</div>
        </td>
        <td>
          <div style="font-weight:500;">${ticket.issueTitle}</div>
          <div style="font-size:11px; color:var(--accent-indigo);">Category: ${ticket.category}</div>
        </td>
        <td style="color:var(--text-secondary); font-size:12px;">${dateFormatted}</td>
        <td>
          <span class="ageing-badge ${ageing.flagClass}">
            ${ageing.text}
          </span>
        </td>
        <td>
          <select class="worker-select" onchange="window.handleAssignWorker('${ticket.id}', this.value)" title="Assign to hostel staff">
            ${workerOptions}
          </select>
        </td>
        <td>
          <span class="status-badge ${statusBadgeClass}">${ticket.status}</span>
        </td>
        <td>
          <div class="btn-icon-group">
            ${ticket.status !== "Resolved" ? `
              <button class="btn-sm-action btn-resolve" onclick="window.markTicketResolved('${ticket.id}')">
                Resolve
              </button>
            ` : `<span style="color:#10b981; font-size:12px; font-weight:600;">✓ Closed</span>`}
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// Handler for worker assignment
async function handleAssignWorker(ticketId, newWorker) {
  if (isFirebaseConnected && db) {
    try {
      const ticketRef = doc(db, "hostel_tickets", ticketId);
      await updateDoc(ticketRef, {
        assignedTo: newWorker,
        status: newWorker !== "Unassigned" ? "In Progress" : "Pending"
      });
    } catch (err) {
      console.error("Worker assignment error:", err);
    }
  } else {
    const target = allHostelTickets.find(t => t.id === ticketId);
    if (target) {
      target.assignedTo = newWorker;
      if (newWorker !== "Unassigned" && target.status === "Pending") target.status = "In Progress";
      renderHostelTickets();
      updateTopMetrics();
    }
  }
}

async function markTicketResolved(ticketId) {
  if (isFirebaseConnected && db) {
    try {
      const ticketRef = doc(db, "hostel_tickets", ticketId);
      await updateDoc(ticketRef, {
        status: "Resolved",
        resolvedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to update ticket:", err);
    }
  } else {
    const target = allHostelTickets.find(t => t.id === ticketId);
    if (target) {
      target.status = "Resolved";
      renderHostelTickets();
      updateTopMetrics();
    }
  }
}

// --- WORKFLOW 2: GATE PASS CLEARANCES ---
function renderGatePassQueue() {
  const tbody = document.getElementById("gatePassTableBody");
  if (!tbody) return;

  let filtered = [...allGatePassRequests];

  if (searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      (p.studentName && p.studentName.toLowerCase().includes(q)) ||
      (p.studentRoll && p.studentRoll.toLowerCase().includes(q)) ||
      (p.destination && p.destination.toLowerCase().includes(q)) ||
      (p.passType && p.passType.toLowerCase().includes(q))
    );
  }

  if (activePassFilter === "pending") {
    filtered = filtered.filter(p => p.wardenApprovalStatus === "Pending");
  } else if (activePassFilter === "approved") {
    filtered = filtered.filter(p => p.wardenApprovalStatus === "Approved");
  } else if (activePassFilter === "rejected") {
    filtered = filtered.filter(p => p.wardenApprovalStatus === "Rejected");
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-box">No gate pass requests found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(pass => {
    const statusClass = (pass.wardenApprovalStatus || "pending").toLowerCase();

    return `
      <tr>
        <td>
          <div style="font-weight:600;">${pass.studentName}</div>
          <div style="font-size:11px; color: var(--text-muted);">${pass.studentRoll} • Room ${pass.roomNo}</div>
        </td>
        <td>
          <span style="font-weight:600; color:var(--accent-indigo);">${pass.passType}</span>
        </td>
        <td>
          <div style="font-weight:500;">${pass.destination}</div>
        </td>
        <td style="font-size:12px; color:var(--text-secondary);">
          <div>Depart: ${pass.departureTime}</div>
          <div>Return: ${pass.returnTime}</div>
        </td>
        <td>
          <div style="max-width: 220px; font-size:12px;">${pass.reason}</div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">📞 ${pass.parentContact}</div>
        </td>
        <td>
          <span class="status-badge ${statusClass}">
            ${pass.wardenApprovalStatus}
          </span>
        </td>
        <td>
          <div class="btn-icon-group">
            <button class="btn-sm-action btn-approve" onclick="window.updatePassDecision('${pass.id}', 'Approved')" title="Approve Leave">
              Approve
            </button>
            <button class="btn-sm-action btn-reject" onclick="window.updatePassDecision('${pass.id}', 'Rejected')" title="Reject Leave">
              Reject
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

async function updatePassDecision(passId, decision) {
  if (isFirebaseConnected && db) {
    try {
      const passRef = doc(db, "gate_passes", passId);
      await updateDoc(passRef, {
        wardenApprovalStatus: decision,
        decidedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to update pass:", err);
    }
  } else {
    const target = allGatePassRequests.find(p => p.id === passId);
    if (target) {
      target.wardenApprovalStatus = decision;
      renderGatePassQueue();
      updateTopMetrics();
    }
  }
}

// --- WORKFLOW 3: NOTICES BOARD ---
function renderNoticeBoard() {
  const container = document.getElementById("noticesContainer");
  if (!container) return;

  let filtered = [...allCampusNotices];

  if (searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(n => 
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.body && n.body.toLowerCase().includes(q)) ||
      (n.category && n.category.toLowerCase().includes(q))
    );
  }

  if (activeNoticeFilter === "academic") {
    filtered = filtered.filter(n => n.category === "academic");
  } else if (activeNoticeFilter === "hostel") {
    filtered = filtered.filter(n => n.category === "hostel");
  } else if (activeNoticeFilter === "urgent") {
    filtered = filtered.filter(n => n.category === "urgent");
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-box" style="grid-column: 1/-1;">No circulars in this stream.</div>`;
    return;
  }

  container.innerHTML = filtered.map(notice => {
    let tagClass = "tag-academic";
    if (notice.category === "hostel") tagClass = "tag-hostel";
    if (notice.category === "urgent") tagClass = "tag-urgent";

    const readCount = Array.isArray(notice.readBy) ? notice.readBy.length : 0;
    const dateFormatted = notice.postedAt ? new Date(notice.postedAt).toLocaleDateString("en-IN", {
      month: "short", day: "numeric"
    }) : "Today";

    return `
      <div class="notice-card">
        <div class="notice-header">
          <span class="notice-tag ${tagClass}">${notice.category}</span>
          <span style="font-size:11px; color:var(--text-muted);">${dateFormatted}</span>
        </div>
        <h3 class="notice-title">${notice.title}</h3>
        <p class="notice-content">${notice.body}</p>
        <div class="notice-footer">
          <span>By: ${notice.postedBy || "Warden Office"}</span>
          <span class="read-metric">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            ${readCount} Students Read
          </span>
        </div>
      </div>
    `;
  }).join("");
}

async function handleBroadcastSubmit(event) {
  event.preventDefault();
  const category = document.getElementById("noticeCategoryInput").value;
  const title = document.getElementById("noticeTitleInput").value;
  const body = document.getElementById("noticeBodyInput").value;

  const newNotice = {
    title,
    category,
    body,
    postedBy: "Chief Warden (Bargarh Hostel)",
    postedAt: new Date().toISOString(),
    readBy: []
  };

  if (isFirebaseConnected && db) {
    try {
      await addDoc(collection(db, "campus_notices"), {
        ...newNotice,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Firestore publish error:", err);
    }
  } else {
    newNotice.id = "notice-" + Date.now();
    allCampusNotices.unshift(newNotice);
    renderNoticeBoard();
    updateTopMetrics();
  }

  document.getElementById("broadcastForm").reset();
  if (window.closeBroadcastModal) window.closeBroadcastModal();
}

// --- FEATURE: EXPORT COMPLAINTS TO CSV ---
function exportComplaintsCSV() {
  if (allHostelTickets.length === 0) {
    alert("No complaint records to export!");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Ticket ID,Student Name,Roll Number,Hostel Block,Room,Category,Issue Description,Logged At,Assigned Worker,Status\n";

  allHostelTickets.forEach(t => {
    const row = [
      `"${t.id || ''}"`,
      `"${t.studentName || ''}"`,
      `"${t.studentRoll || ''}"`,
      `"${t.hostelBlock || ''}"`,
      `"${t.roomNo || ''}"`,
      `"${t.category || ''}"`,
      `"${(t.issueTitle || '').replace(/"/g, '""')}"`,
      `"${t.loggedAt || ''}"`,
      `"${t.assignedTo || 'Unassigned'}"`,
      `"${t.status || 'Pending'}"`
    ].join(",");
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Hostel_Complaints_Bargarh_${new Date().toISOString().substring(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// --- FEATURE: SEARCH HANDLER ---
function handleGlobalSearch(event) {
  searchQuery = event.target.value;
  renderHostelTickets();
  renderGatePassQueue();
  renderNoticeBoard();
}

// --- METRICS & SLA HEALTH BAR ---
function updateTopMetrics() {
  let redCount = 0;
  let amberCount = 0;
  let greenCount = 0;

  allHostelTickets.forEach(t => {
    if (t.status !== "Resolved") {
      const ageing = checkAgeingRedFlag(t.loggedAt, t.status);
      if (ageing.hours >= 24) redCount++;
      else if (ageing.hours >= 12) amberCount++;
      else greenCount++;
    }
  });

  const pendingPasses = allGatePassRequests.filter(p => p.wardenApprovalStatus === "Pending").length;
  const resolvedCount = allHostelTickets.filter(t => t.status === "Resolved").length;
  const totalReads = allCampusNotices.reduce((acc, curr) => acc + (Array.isArray(curr.readBy) ? curr.readBy.length : 0), 0);

  const elRed = document.getElementById("statRedTickets");
  const elPasses = document.getElementById("statPendingPasses");
  const elResolved = document.getElementById("statResolvedToday");
  const elReads = document.getElementById("statNoticeReads");
  const badgeRed = document.getElementById("redAgeingCounter");
  const badgePasses = document.getElementById("pendingPassCounter");

  if (elRed) elRed.innerText = redCount;
  if (elPasses) elPasses.innerText = pendingPasses;
  if (elResolved) elResolved.innerText = resolvedCount;
  if (elReads) elReads.innerText = totalReads;
  if (badgeRed) badgeRed.innerText = redCount;
  if (badgePasses) badgePasses.innerText = pendingPasses;

  // SLA health bar percentages
  const activeUnresolved = redCount + amberCount + greenCount;
  const elGreenBar = document.getElementById("slaGreenBar");
  const elAmberBar = document.getElementById("slaAmberBar");
  const elRedBar = document.getElementById("slaRedBar");
  const elHealthText = document.getElementById("slaHealthText");

  if (activeUnresolved > 0) {
    const pGreen = Math.round((greenCount / activeUnresolved) * 100);
    const pAmber = Math.round((amberCount / activeUnresolved) * 100);
    const pRed = Math.max(0, 100 - pGreen - pAmber);

    if (elGreenBar) elGreenBar.style.width = pGreen + "%";
    if (elAmberBar) elAmberBar.style.width = pAmber + "%";
    if (elRedBar) elRedBar.style.width = pRed + "%";
    if (elHealthText) elHealthText.innerText = `${activeUnresolved} active tickets • ${redCount} overdue (>24h) needing warden escalation`;
  } else {
    if (elGreenBar) elGreenBar.style.width = "100%";
    if (elAmberBar) elAmberBar.style.width = "0%";
    if (elRedBar) elRedBar.style.width = "0%";
    if (elHealthText) elHealthText.innerText = "All hostel maintenance tickets resolved!";
  }
}

// Global Filter Callbacks
window.filterComplaints = function(type) {
  activeComplaintFilter = type;
  document.querySelectorAll('#tab-complaints .filter-pill').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  renderHostelTickets();
};

window.filterPasses = function(type) {
  activePassFilter = type;
  document.querySelectorAll('#tab-gatepass .filter-pill').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  renderGatePassQueue();
};

window.filterNotices = function(type) {
  activeNoticeFilter = type;
  document.querySelectorAll('#tab-notices .filter-pill').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  renderNoticeBoard();
};

// Window bindings
window.toggleTheme = toggleTheme;
window.handleGlobalSearch = handleGlobalSearch;
window.exportComplaintsCSV = exportComplaintsCSV;
window.handleAssignWorker = handleAssignWorker;
window.markTicketResolved = markTicketResolved;
window.updatePassDecision = updatePassDecision;
window.handleBroadcastSubmit = handleBroadcastSubmit;

// Boot on DOM loaded
window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initFirebaseApp();
});
