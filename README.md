# Problem Statement 07: Campus Life, Debugged (Fretbox)
### 24-Hour Fast-Paced Hackathon Prototype

Replacing chaotic paper registers, notice boards, and unorganized WhatsApp groups with a unified, real-time campus administration platform for students and wardens.

---

## 📂 Project Structure

```text
c:/my-project/Hakethon/PS7/
├── index.html              # Unified Administrator Dashboard UI
├── style.css               # Glassmorphic dark UI with color-coded complaint ageing tags
├── app.js                  # Vanilla JavaScript (ES6) Firestore listeners & workflows
├── student_dashboard.dart  # Flutter student app (Complaints, Gate Pass, Notices with Mark as Read)
├── database_seed.js        # Node.js seeder script (5 realistic dummy records per collection)
└── README.md               # Quick setup & presentation guide
```

---

## 🔑 Where to Paste Your `firebaseConfig`

### 1. In the Web Admin Dashboard (`app.js`)
Open [app.js](file:///c:/my-project/Hakethon/PS7/app.js) and locate lines 8-16:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyYOUR_API_KEY_HERE",
  authDomain: "campuslife-ps7.firebaseapp.com",
  projectId: "campuslife-ps7",
  storageBucket: "campuslife-ps7.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```
Replace the values with your credentials from **Firebase Console → Project Settings → General → Web Apps**.

> [!TIP]
> **Pitch-Ready Offline Demo Mode:** If `firebaseConfig` is not yet configured, `app.js` will automatically switch to **"Demo Mock Mode (Live)"** with all 3 workflows fully interactive so you can present immediately to judges without fear of network errors!

### 2. In the Seeder Script (`database_seed.js`)
Open [database_seed.js](file:///c:/my-project/Hakethon/PS7/database_seed.js) and paste the same `firebaseConfig` on lines 8-16.

### 3. In the Flutter Student App (`student_dashboard.dart`)
Run Flutter Firebase CLI in your Flutter root directory:
```bash
flutterfire configure
```
or place your `google-services.json` inside `android/app/`.

---

## ⚡ Quick Start Guide

### Step 1: Push Dummy Data to Firestore (Optional)
Make sure `firebase` is installed:
```bash
npm install firebase
node database_seed.js
```

### Step 2: Launch the Admin Dashboard
Since it uses ES6 modules, open it using any local static HTTP server:
```bash
npx serve .
```
or with Python:
```bash
python -m http.server 8080
```
Then visit `http://localhost:8080` (or `http://localhost:3000`).

### Step 3: Run the Flutter Student Dashboard
Add the required dependencies to your `pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  cloud_firestore: ^4.17.5
  firebase_core: ^2.32.0
```
Run on Android Emulator, iOS Simulator, or Chrome:
```bash
flutter run
```

---

## 🎯 Implemented Workflows & Features

1. **Hostel Maintenance & Complaint Ageing:**
   - Real-time logging of issues (Plumbing, Electrical, Wi-Fi, Carpentry).
   - Automated color-coded **Complaint Ageing**:
     - 🔴 **Red Alert (> 24 Hours):** Critical Warden action required (e.g., tap leaking 34 hrs).
     - 🟡 **Amber Warning (12 - 24 Hours):** Unattended complaints.
     - 🟢 **Normal (< 12 Hours):** Fresh complaints.
   - One-click Warden resolution button (`Mark Resolved`).

2. **Gate Pass & Leave Clearances:**
   - Replaces paper outing slips and sign-out registers.
   - Real-time **Approve / Reject** buttons.
   - Automatic status updates synced between Warden dashboard and Student mobile app.

3. **Targeted Notice Board:**
   - Targeted streams: Academic (*Compiler Design*, *Computer Architecture*, *Microprocessors*) & Hostel Mess.
   - **"Mark as Read" action tracking:** Tracks individual student acknowledgements with counter updates.
   - Warden modal to broadcast announcements instantly without WhatsApp clutter.
