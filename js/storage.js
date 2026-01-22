// js/storage.js (UniTrack Offline Database)

const DB_KEY = "unitrack_db_v1";

const defaultDB = () => ({
  meta: {
    app: "UniTrack",
    version: 1,
    periodsPerDay: 5,
    createdAt: new Date().toISOString(),
  },

  users: [
    { id: "u_admin", name: "Admin", email: "admin@unitrack.com", role: "admin" },
    { id: "u_teacher", name: "Teacher", email: "teacher@unitrack.com", role: "teacher" },
  ],

  session: { userId: "u_admin" },

  departments: [
    { id: "dept_cse", name: "Computer Science" },
  ],

  classes: [
    // class = dept + batch + semester + section
    { id: "cls_cse_s4_a", deptId: "dept_cse", batch: "2023-26", semester: 4, section: "A", classTeacherId: "u_teacher" },
  ],

  students: [
    // { id, name, rollNo, regNo, phone, parentPhone, photo, deptId, classId, semester }
  ],

  attendance: [
    // { date:"YYYY-MM-DD", classId, period:1..5 OR "FULL", subject:"", records:{studentId: "P|A|L|OD"}, locked:false, updatedAt }
  ],

  leaves: [
    // { id, studentId, from, to, type:"LEAVE|OD", reason, status:"PENDING|APPROVED|REJECTED", createdAt }
  ],

  logs: [
    // { id, at, userId, action }
  ],
});

export function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const db = defaultDB();
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return db;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const db = defaultDB();
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return db;
  }
}

export function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function getSessionUser(db) {
  const u = db.users.find(x => x.id === db.session.userId);
  return u || db.users[0];
}

export function setSessionUser(userId) {
  const db = loadDB();
  db.session.userId = userId;
  saveDB(db);
}

export function addLog(action) {
  const db = loadDB();
  db.logs.unshift({
    id: uid("log"),
    at: new Date().toISOString(),
    userId: db.session.userId,
    action,
  });
  db.logs = db.logs.slice(0, 60);
  saveDB(db);
}

export function exportBackupJSON() {
  const db = loadDB();
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `unitrack_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  addLog("Created offline backup JSON");
}

export function restoreBackupJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        localStorage.setItem(DB_KEY, JSON.stringify(parsed));
        addLog("Restored backup JSON");
        resolve(true);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// ---------- Students ----------
export function addStudent(student) {
  const db = loadDB();
  student.id = uid("stu");
  db.students.push(student);
  saveDB(db);
  addLog(`Added student: ${student.name} (Roll ${student.rollNo})`);
  return student;
}

export function getStudentsByClass(classId) {
  const db = loadDB();
  return db.students.filter(s => s.classId === classId).sort((a,b)=>a.rollNo-b.rollNo);
}

export function autoRollSort(classId) {
  const db = loadDB();
  const list = db.students.filter(s => s.classId === classId).sort((a,b)=>a.name.localeCompare(b.name));
  list.forEach((s,i) => (s.rollNo = i + 1));
  saveDB(db);
  addLog(`Auto roll sorting done for class ${classId}`);
}
