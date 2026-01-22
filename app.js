initTheme();

function getSession() {
  try {
    return JSON.parse(localStorage.getItem("session"));
  } catch {
    return null;
  }
}

function requireAuth() {
  const isLoginPage = location.pathname.toLowerCase().includes("login.html");
  const session = getSession();

  if (!session && !isLoginPage && !location.pathname.endsWith("/index.html")) {
    window.location.href = "login.html";
    return;
  }

  const userRole = document.getElementById("userRole");
  if (userRole && session) userRole.textContent = session.role.toUpperCase();
}

function logout() {
  localStorage.removeItem("session");
  window.location.href = "login.html";
}

document.getElementById("logoutBtn")?.addEventListener("click", logout);

requireAuth();

// Demo dashboard numbers
document.getElementById("totalStudents") && (document.getElementById("totalStudents").textContent = "420");
document.getElementById("presentToday") && (document.getElementById("presentToday").textContent = "388");
document.getElementById("completion") && (document.getElementById("completion").textContent = "91%");
document.getElementById("defaulters") && (document.getElementById("defaulters").textContent = "27");

const activityList = document.getElementById("activityList");
if (activityList) {
  const logs = [
    "Teacher Riya marked attendance (CSE S4) ✅",
    "Admin updated student photo (Roll 18) 🖼️",
    "Teacher Amal edited period 3 attendance ✏️",
    "Backup created successfully ☁️"
  ];
  activityList.innerHTML = logs.map(l => `<div class="list-item">${l}</div>`).join("");
}
