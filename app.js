// Global Variables
let currentUser = null;
let userRole = null;
let qrSession = null;
let qrTimer = null;

// ================== LOCAL STORAGE DATABASE (Demo Mode) ==================
// Using localStorage instead of Firebase for demo/testing

class LocalDB {
    constructor() {
        this.initDefaultData();
    }

    initDefaultData() {
        if (!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify([]));
        if (!localStorage.getItem('students')) localStorage.setItem('students', JSON.stringify([]));
        if (!localStorage.getItem('attendance')) localStorage.setItem('attendance', JSON.stringify([]));
        if (!localStorage.getItem('qrSessions')) localStorage.setItem('qrSessions', JSON.stringify([]));
        if (!localStorage.getItem('leaveRequests')) localStorage.setItem('leaveRequests', JSON.stringify([]));
    }

    // Users (Teachers/Admins)
    addUser(email, name, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === email)) return { error: 'Email already exists' };
        
        const user = {
            id: Date.now().toString(),
            email,
            name,
            password,
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return { success: true, user };
    }

    findUserByEmail(email) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.find(u => u.email === email);
    }

    // Students
    addStudent(name, roll, email, password) {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        if (students.find(s => s.rollNumber === roll)) return { error: 'Roll number already exists' };
        
        const student = {
            id: Date.now().toString(),
            name,
            email,
            rollNumber: roll,
            password,
            createdAt: new Date().toISOString()
        };
        students.push(student);
        localStorage.setItem('students', JSON.stringify(students));
        return { success: true, student };
    }

    findStudentByRoll(roll) {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        return students.find(s => s.rollNumber === roll);
    }

    getAllStudents() {
        return JSON.parse(localStorage.getItem('students') || '[]');
    }

    deleteStudent(id) {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const filtered = students.filter(s => s.id !== id);
        localStorage.setItem('students', JSON.stringify(filtered));
    }

    // Attendance
    addAttendance(studentId, studentName, studentRoll, classRoom, date, period, status, qrToken = null) {
        const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
        
        const record = {
            id: Date.now().toString(),
            studentId,
            studentName,
            studentRoll,
            class: classRoom,
            date,
            period,
            status,
            qrToken,
            timestamp: new Date().toISOString()
        };
        attendance.push(record);
        localStorage.setItem('attendance', JSON.stringify(attendance));
        return record;
    }

    getAttendanceByDate(date) {
        const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
        return attendance.filter(a => a.date === date);
    }

    getAttendanceByStudent(studentId) {
        const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
        return attendance.filter(a => a.studentId === studentId);
    }

    getAllAttendance() {
        return JSON.parse(localStorage.getItem('attendance') || '[]');
    }

    // QR Sessions
    addQRSession(token, classRoom, date, period, expiryTime) {
        const qrSessions = JSON.parse(localStorage.getItem('qrSessions') || '[]');
        
        const session = {
            id: Date.now().toString(),
            token,
            class: classRoom,
            date,
            period,
            expiryTime,
            createdAt: new Date().toISOString(),
            scans: []
        };
        qrSessions.push(session);
        localStorage.setItem('qrSessions', JSON.stringify(qrSessions));
        return session;
    }

    findQRSession(token) {
        const qrSessions = JSON.parse(localStorage.getItem('qrSessions') || '[]');
        return qrSessions.find(s => s.token === token);
    }

    addQRScan(sessionId, studentId, studentName) {
        const qrSessions = JSON.parse(localStorage.getItem('qrSessions') || '[]');
        const session = qrSessions.find(s => s.id === sessionId);
        
        if (session) {
            session.scans.push({
                studentId,
                studentName,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('qrSessions', JSON.stringify(qrSessions));
        }
    }

    // Leave Requests
    addLeaveRequest(studentId, studentName, studentRoll, startDate, endDate, type, reason) {
        const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
        
        const request = {
            id: Date.now().toString(),
            studentId,
            studentName,
            studentRoll,
            startDate,
            endDate,
            type,
            reason,
            status: 'Pending',
            createdAt: new Date().toISOString()
        };
        leaveRequests.push(request);
        localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));
        return request;
    }

    getAllLeaveRequests() {
        return JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    }

    updateLeaveRequest(id, status) {
        const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
        const request = leaveRequests.find(r => r.id === id);
        if (request) {
            request.status = status;
            localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));
        }
    }
}

// Initialize local database
const localDB = new LocalDB();

// Demo mode flag
const DEMO_MODE = true;
console.log('🎉 DEMO MODE ENABLED - Using localStorage instead of Firebase');

// ================== ROLE SELECTION ==================
function selectRole(role) {
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.role-form').forEach(form => form.classList.remove('active'));
    
    event.target.classList.add('active');
    
    if (role === 'admin') {
        document.getElementById('adminLoginDiv').classList.add('active');
    } else {
        document.getElementById('studentLoginDiv').classList.add('active');
    }
}

// ================== AUTHENTICATION ==================
function toggleSignup(type) {
    const adminLoginDiv = document.getElementById('adminLoginDiv');
    const studentLoginDiv = document.getElementById('studentLoginDiv');
    const signupDiv = document.getElementById('signupDiv');
    
    if (type === 'back') {
        // Back to login
        adminLoginDiv.classList.add('active');
        studentLoginDiv.classList.remove('active');
        signupDiv.classList.add('hidden');
        signupDiv.classList.remove('active');
    } else {
        // Show signup
        adminLoginDiv.classList.remove('active');
        studentLoginDiv.classList.remove('active');
        signupDiv.classList.remove('hidden');
        signupDiv.classList.add('active');
        
        document.getElementById('signupTitle').innerText = type === 'admin' ? 'Teacher Sign Up' : 'Student Sign Up';
        document.getElementById('signupRoll').classList.toggle('hidden', type === 'admin');
    }
}

async function loginAdmin() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    if (!email || !password) {
        alert('Please fill all fields');
        return;
    }
    
    try {
        // Demo mode - check localStorage
        const user = localDB.findUserByEmail(email);
        
        if (!user || user.password !== password) {
            alert('Invalid email or password');
            return;
        }
        
        currentUser = {
            uid: user.id,
            email: user.email,
            name: user.name
        };
        userRole = 'admin';
        showPanel('admin');
        loadAdminData();
        alert('✅ Login successful!');
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

async function loginStudent() {
    const roll = document.getElementById('studentRoll').value;
    const password = document.getElementById('studentPassword').value;
    
    if (!roll || !password) {
        alert('Please fill all fields');
        return;
    }
    
    try {
        // Demo mode - check localStorage
        const student = localDB.findStudentByRoll(roll);
        
        if (!student || student.password !== password) {
            alert('Invalid roll number or password');
            return;
        }
        
        currentUser = {
            uid: student.id,
            email: student.email,
            rollNumber: roll,
            name: student.name
        };
        userRole = 'student';
        showPanel('student');
        loadStudentData();
        alert('✅ Login successful!');
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

async function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const roll = document.getElementById('signupRoll').value;
    
    if (!name || !email || !password) {
        alert('Please fill all fields');
        return;
    }
    
    // Determine signup type based on roll number field visibility
    const isStudent = !document.getElementById('signupRoll').classList.contains('hidden') && roll;
    
    if (isStudent && !roll) {
        alert('Roll number required for student signup');
        return;
    }
    
    try {
        if (isStudent) {
            // Student Signup
            const result = localDB.addStudent(name, roll, email, password);
            
            if (result.error) {
                alert(result.error);
                return;
            }
            
            alert('✅ Student account created. You can now login.');
            toggleSignup('back');
        } else {
            // Admin Signup
            const result = localDB.addUser(email, name, password);
            
            if (result.error) {
                alert(result.error);
                return;
            }
            
            alert('✅ Admin account created. You can now login.');
            toggleSignup('back');
        }
        
        // Clear form
        document.getElementById('signupName').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
        document.getElementById('signupRoll').value = '';
    } catch (error) {
        alert('Signup failed: ' + error.message);
    }
}

function logout() {
    currentUser = null;
    userRole = null;
    qrSession = null;
    
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('loginSection').classList.add('active');
    
    document.getElementById('adminEmail').value = '';
    document.getElementById('adminPassword').value = '';
    document.getElementById('studentRoll').value = '';
    document.getElementById('studentPassword').value = '';
}

// ================== UI NAVIGATION ==================
function showPanel(panel) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    if (panel === 'admin') {
        document.getElementById('adminPanel').classList.add('active');
        showAdminView('dashboard');
    } else {
        document.getElementById('studentPanel').classList.add('active');
        showStudentView('overview');
    }
}

function showAdminView(view) {
    document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.admin-nav .nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(view + 'View').classList.add('active');
    event.target.classList.add('active');
}

function showStudentView(view) {
    document.querySelectorAll('.student-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.student-nav .nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(view + 'View').classList.add('active');
    event.target.classList.add('active');
    
    // Load view-specific data
    if (view === 'calendar') {
        loadStudentCalendar();
    }
}

// ================== ADMIN FUNCTIONS ==================
async function loadAdminData() {
    try {
        // Load total students
        const students = localDB.getAllStudents();
        document.getElementById('totalStudents').innerText = students.length;
        
        // Load present today count
        const today = new Date().toISOString().split('T')[0];
        const attendance = localDB.getAllAttendance();
        const presentToday = attendance.filter(a => a.date === today && a.status === 'Present').length;
        
        document.getElementById('presentToday').innerText = presentToday;
        
        // Load students with low attendance
        let lowCount = 0;
        students.forEach(student => {
            const studentAttendance = localDB.getAttendanceByStudent(student.id);
            if (studentAttendance.length > 0) {
                const present = studentAttendance.filter(a => a.status === 'Present').length;
                const percent = (present / studentAttendance.length) * 100;
                if (percent < 75) lowCount++;
            }
        });
        
        document.getElementById('lowAttendance').innerText = lowCount;
        
        // Load students list
        loadStudentsList();
    } catch (error) {
        console.error('Error loading admin data:', error);
    }
}

async function loadStudentsList() {
    try {
        const students = localDB.getAllStudents();
        const list = document.getElementById('studentsList');
        list.innerHTML = '';
        
        students.forEach(student => {
            const item = document.createElement('div');
            item.className = 'student-item';
            item.innerHTML = `
                <div class="student-info">
                    <span><strong>${student.name}</strong></span>
                    <span>Roll: ${student.rollNumber}</span>
                </div>
                <div class="student-actions">
                    <button class="delete-btn" onclick="deleteStudent('${student.id}')">Delete</button>
                </div>
            `;
            list.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

async function addStudent() {
    const name = document.getElementById('studentName').value;
    const roll = document.getElementById('studentRollInput').value;
    const email = document.getElementById('studentEmailInput').value;
    const password = document.getElementById('studentPassInput').value;
    
    if (!name || !roll || !email || !password) {
        alert('Please fill all fields');
        return;
    }
    
    try {
        const result = localDB.addStudent(name, roll, email, password);
        
        if (result.error) {
            alert(result.error);
            return;
        }
        
        document.getElementById('studentName').value = '';
        document.getElementById('studentRollInput').value = '';
        document.getElementById('studentEmailInput').value = '';
        document.getElementById('studentPassInput').value = '';
        
        loadStudentsList();
        loadAdminData();
        alert('✅ Student added successfully');
    } catch (error) {
        alert('Error adding student: ' + error.message);
    }
}

async function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        try {
            localDB.deleteStudent(id);
            loadStudentsList();
            loadAdminData();
            alert('✅ Student deleted');
        } catch (error) {
            alert('Error deleting student: ' + error.message);
        }
    }
}

async function loadAttendanceForm() {
    const classSelect = document.getElementById('classSelect').value;
    const date = document.getElementById('attendanceDate').value;
    const period = document.getElementById('periodSelect').value;
    
    if (!classSelect || !date || !period) {
        alert('Please select all fields');
        return;
    }
    
    try {
        const students = localDB.getAllStudents();
        const form = document.getElementById('attendanceForm');
        form.innerHTML = '';
        
        let hasStudents = false;
        
        students.forEach(student => {
            hasStudents = true;
            const item = document.createElement('div');
            item.className = 'attendance-item';
            item.innerHTML = `
                <label>${student.name} (${student.rollNumber})</label>
                <label><input type="radio" name="status-${student.id}" value="Present" /> P</label>
                <label><input type="radio" name="status-${student.id}" value="Absent" /> A</label>
                <label><input type="radio" name="status-${student.id}" value="Late" /> L</label>
                <label><input type="radio" name="status-${student.id}" value="Leave" /> LV</label>
            `;
            form.appendChild(item);
        });
        
        if (hasStudents) {
            document.getElementById('saveAttendanceBtn').classList.remove('hidden');
        } else {
            alert('No students found');
        }
    } catch (error) {
        alert('Error loading attendance: ' + error.message);
    }
}

async function saveAttendance() {
    const classSelect = document.getElementById('classSelect').value;
    const date = document.getElementById('attendanceDate').value;
    const period = document.getElementById('periodSelect').value;
    
    try {
        const students = localDB.getAllStudents();
        
        for (const student of students) {
            const status = document.querySelector(`input[name="status-${student.id}"]:checked`);
            
            if (status) {
                localDB.addAttendance(
                    student.id,
                    student.name,
                    student.rollNumber,
                    classSelect,
                    date,
                    period,
                    status.value
                );
            }
        }
        
        alert('✅ Attendance saved successfully');
        document.getElementById('attendanceForm').innerHTML = '';
        document.getElementById('saveAttendanceBtn').classList.add('hidden');
    } catch (error) {
        alert('Error saving attendance: ' + error.message);
    }
}

// ================== QR ATTENDANCE ==================
function generateQR() {
    const classSelect = document.getElementById('qrClassSelect').value;
    const date = document.getElementById('qrDate').value;
    const period = document.getElementById('qrPeriodSelect').value;
    
    if (!classSelect || !date || !period) {
        alert('Please select all fields');
        return;
    }
    
    try {
        // Generate one-time token
        const token = generateToken();
        const expiryTime = Date.now() + (2 * 60 * 1000); // 2 minutes
        
        // Store QR session in localStorage
        localDB.addQRSession(token, classSelect, date, period, expiryTime);
        
        qrSession = {
            token,
            class: classSelect,
            date,
            period,
            expiryTime
        };
        
        // Generate QR Code
        const qrContainer = document.getElementById('qrCode');
        qrContainer.innerHTML = '';
        
        new QRCode(qrContainer, {
            text: token,
            width: 250,
            height: 250,
            colorDark: '#667eea',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
        
        document.getElementById('tokenDisplay').innerText = `Token: ${token}`;
        document.getElementById('qrContainer').classList.remove('hidden');
        document.getElementById('qrSessionInfo').classList.remove('hidden');
        
        // Start timer
        startQRTimer(expiryTime);
        
        // Listen for scans
        listenForQRScans(token);
    } catch (error) {
        alert('Error generating QR: ' + error.message);
    }
}

function generateToken() {
    return 'QR' + Date.now() + Math.random().toString(36).substr(2, 9);
}

function startQRTimer(expiryTime) {
    if (qrTimer) clearInterval(qrTimer);
    
    qrTimer = setInterval(() => {
        const remaining = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
        document.getElementById('qrTimer').innerText = remaining;
        
        if (remaining === 0) {
            clearInterval(qrTimer);
            alert('QR Code Expired');
            closeQR();
        }
    }, 1000);
}

function listenForQRScans(token) {
    const scanList = document.getElementById('qrScanList');
    
    // Poll for scans
    const scanInterval = setInterval(() => {
        if (!qrSession) {
            clearInterval(scanInterval);
            return;
        }
        
        const scans = JSON.parse(localStorage.getItem('qrScans') || '[]');
        const sessionScans = scans.filter(s => s.token === token);
        
        scanList.innerHTML = '<h4>Student Scans:</h4>';
        
        if (sessionScans.length > 0) {
            sessionScans.forEach(scan => {
                const item = document.createElement('div');
                item.className = 'scan-item present';
                item.innerHTML = `
                    <strong>${scan.studentName}</strong>
                    <span>${new Date(scan.timestamp).toLocaleTimeString()}</span>
                `;
                scanList.appendChild(item);
            });
        } else {
            scanList.innerHTML += '<p>Waiting for student scans...</p>';
        }
    }, 2000); // Check every 2 seconds
}

function closeQR() {
    if (qrTimer) clearInterval(qrTimer);
    qrSession = null;
    document.getElementById('qrContainer').classList.add('hidden');
    document.getElementById('qrSessionInfo').classList.add('hidden');
    document.getElementById('qrCode').innerHTML = '';
}

// ================== STUDENT FUNCTIONS ==================
async function loadStudentData() {
    try {
        // Calculate attendance percentage using localStorage
        const attendance = localDB.getAttendanceByStudent(currentUser.uid);
        
        const statuses = {};
        attendance.forEach(record => {
            const status = record.status;
            statuses[status] = (statuses[status] || 0) + 1;
        });
        
        const total = attendance.length;
        const present = statuses['Present'] || 0;
        const percent = total === 0 ? 0 : Math.round((present / total) * 100);
        
        document.getElementById('attendancePercent').innerText = percent + '%';
        document.getElementById('progressFill').style.width = percent + '%';
        document.getElementById('totalClasses').innerText = total;
        document.getElementById('presentCount').innerText = present;
        document.getElementById('absentCount').innerText = (statuses['Absent'] || 0);
    } catch (error) {
        console.error('Error loading student data:', error);
    }
}

async function startCamera() {
    try {
        const video = document.getElementById('qrVideo');
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        
        video.srcObject = stream;
        video.classList.remove('hidden');
        document.getElementById('startCameraBtn').innerText = '📷 Camera Active';
        document.getElementById('startCameraBtn').disabled = true;
        
        scanQRCode(video);
    } catch (error) {
        alert('Camera access denied: ' + error.message);
    }
}

function scanQRCode(video) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    function scan() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        
        if (code) {
            processQRToken(code.data);
            video.srcObject.getTracks().forEach(track => track.stop());
            video.classList.add('hidden');
            document.getElementById('startCameraBtn').disabled = false;
            document.getElementById('startCameraBtn').innerText = '📷 Start Camera';
        } else {
            requestAnimationFrame(scan);
        }
    }
    
    scan();
}

function scanQRManual() {
    const token = document.getElementById('qrManualInput').value;
    if (!token) {
        alert('Please enter token');
        return;
    }
    processQRToken(token);
}

function processQRToken(token) {
    try {
        // Find QR session with this token
        const qrSession = localDB.findQRSession(token);
        
        if (!qrSession) {
            showScanResult('Invalid QR Code', false);
            return;
        }
        
        // Check if expired
        if (Date.now() > qrSession.expiryTime) {

            showScanResult('QR Code Expired', false);
            return;
        }
        
        // Check if already scanned by this student
        const scans = JSON.parse(localStorage.getItem('qrScans') || '[]');
        const alreadyScanned = scans.some(s => s.token === token && s.studentId === currentUser.uid);
        
        if (alreadyScanned) {
            showScanResult('You already marked attendance for this period', false);
            return;
        }
        
        // Mark attendance
        localDB.addQRScan(token, currentUser.uid, currentUser.name, currentUser.rollNumber);
        
        // Also add to attendance records
        localDB.addAttendance(
            currentUser.uid,
            currentUser.name,
            currentUser.rollNumber,
            qrSession.class,
            qrSession.date,
            qrSession.period,
            'Present'
        );
        
        showScanResult('✅ Attendance Marked Successfully', true);
        document.getElementById('qrManualInput').value = '';
    } catch (error) {
        showScanResult('Error: ' + error.message, false);
    }
}

function showScanResult(message, success) {
    const resultDiv = document.getElementById('scanResult');
    resultDiv.innerHTML = message;
    resultDiv.className = success ? 'scan-result success' : 'scan-result error';
    resultDiv.style.display = 'block';
    
    setTimeout(() => {
        resultDiv.style.display = 'none';
    }, 3000);
}

async function loadStudentCalendar() {
    try {
        // Get all attendance records for this student
        const attendance = localDB.getAttendanceByStudent(currentUser.uid);
        const calendar = document.getElementById('attendanceCalendar');
        calendar.innerHTML = '';
        
        // Group by date
        const dateMap = {};
        attendance.forEach(record => {
            if (!dateMap[record.date]) dateMap[record.date] = [];
            dateMap[record.date].push(record);
        });
        
        Object.keys(dateMap).sort().forEach(date => {
            const records = dateMap[date];
            const item = document.createElement('div');
            item.className = 'calendar-item';
            
            const statusClass = records[0].status === 'Present' ? 'present' : 'absent';
            item.innerHTML = `
                <div class="${statusClass}">
                    <strong>${date}</strong>
                    <span>${records[0].status}</span>
                    <span>Period ${records[0].period}</span>
                </div>
            `;
            calendar.appendChild(item);
        });
        
        if (attendance.length === 0) {
            calendar.innerHTML = '<p>No attendance records yet</p>';
        }
    } catch (error) {
        console.error('Error loading calendar:', error);
    }
}

async function submitLeaveRequest() {
    const startDate = document.getElementById('leaveStartDate').value;
    const endDate = document.getElementById('leaveEndDate').value;
    const reason = document.getElementById('leaveReason').value;
    
    if (!startDate || !endDate || !reason) {
        alert('Please fill all fields');
        return;
    }
    
    try {
        localDB.addLeaveRequest(
            currentUser.uid,
            currentUser.name,
            currentUser.rollNumber,
            startDate,
            endDate,
            reason
        );
        
        document.getElementById('leaveStartDate').value = '';
        document.getElementById('leaveEndDate').value = '';
        document.getElementById('leaveReason').value = '';
        
        alert('✅ Leave request submitted');
        loadLeaveStatus();
    } catch (error) {
        alert('Error submitting leave: ' + error.message);
    }
}

async function loadLeaveStatus() {
    try {
        const leaves = localDB.getAllLeaveRequests();
        const studentLeaves = leaves.filter(l => l.studentId === currentUser.uid);
        
        const statusDiv = document.getElementById('leaveStatus');
        statusDiv.innerHTML = '';
        
        studentLeaves.forEach(leave => {
            const item = document.createElement('div');
            item.className = 'leave-item';
            item.innerHTML = `
                <div>
                    <strong>${leave.startDate} to ${leave.endDate}</strong>
                    <p>${leave.reason}</p>
                </div>
                <div class="leave-status ${leave.status?.toLowerCase() || 'pending'}">
                    ${leave.status || 'Pending'}
                </div>
            `;
            statusDiv.appendChild(item);
        });
        
        if (studentLeaves.length === 0) {
            statusDiv.innerHTML = '<p>No leave requests</p>';
        }
    } catch (error) {
        console.error('Error loading leaves:', error);
    }
}

// ================== REPORTS ==================
async function generateReport() {
    try {
        const month = document.getElementById('reportMonth').value;
        
        if (!month) {
            alert('Please select a month');
            return;
        }
        
        const students = localDB.getAllStudents();
        const attendance = localDB.getAllAttendance();
        
        const monthAttendance = attendance.filter(a => a.date.startsWith(month));
        
        const reportContent = document.getElementById('reportContent');
        let html = '<table class="report-table"><thead><tr><th>Roll</th><th>Name</th><th>Present</th><th>Absent</th><th>Late</th><th>Leave</th><th>Percentage</th></tr></thead><tbody>';
        
        const stats = {};
        students.forEach(student => {
            stats[student.id] = { present: 0, absent: 0, late: 0, leave: 0, name: student.name, roll: student.rollNumber };
        });
        
        monthAttendance.forEach(record => {
            if (stats[record.studentId]) {
                const status = record.status;
                if (status === 'Present') stats[record.studentId].present++;
                else if (status === 'Absent') stats[record.studentId].absent++;
                else if (status === 'Late') stats[record.studentId].late++;
                else if (status === 'Leave') stats[record.studentId].leave++;
            }
        });
        
        for (let id in stats) {
            const s = stats[id];
            const total = s.present + s.absent + s.late + s.leave;
            const percent = total === 0 ? 0 : Math.round((s.present / total) * 100);
            const lowClass = percent < 75 ? 'low-attendance' : '';
            
            html += `<tr class="${lowClass}">
                <td>${s.roll}</td>
                <td>${s.name}</td>
                <td>${s.present}</td>
                <td>${s.absent}</td>
                <td>${s.late}</td>
                <td>${s.leave}</td>
                <td>${percent}%</td>
            </tr>`;
        }
        
        html += '</tbody></table>';
        reportContent.innerHTML = html;
    } catch (error) {
        alert('Error generating report: ' + error.message);
    }
}

function exportToCSV() {
    const table = document.querySelector('.report-table');
    if (!table) {
        alert('Please generate a report first');
        return;
    }
    
    let csv = '';
    table.querySelectorAll('tr').forEach(row => {
        const cols = row.querySelectorAll('td, th');
        csv += Array.from(cols).map(col => col.innerText).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_report.csv';
    a.click();
}

function printReport() {
    window.print();
}

// Initialize month selector
document.addEventListener('DOMContentLoaded', () => {
    const monthSelect = document.getElementById('reportMonth');
    if (monthSelect) {
        const today = new Date();
        
        for (let i = 0; i < 12; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
            const text = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            
            const option = document.createElement('option');
            option.value = value;
            option.text = text;
            monthSelect.appendChild(option);
        }
    }
});
