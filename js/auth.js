initTheme();

const loginForm = $("loginForm");

function saveSession(user) {
  localStorage.setItem("session", JSON.stringify(user));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem("session"));
  } catch {
    return null;
  }
}

loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = $("email").value.trim().toLowerCase();
  const pass = $("password").value.trim();

  // Demo accounts (we replace with Firebase Auth in Step 2)
  if (email === "admin@unitrack.com" && pass === "123456") {
    saveSession({ role: "admin", email });
    toast("Welcome Admin ✅");
    setTimeout(() => (window.location.href = "dashboard.html"), 700);
    return;
  }

  if (email === "teacher@unitrack.com" && pass === "123456") {
    saveSession({ role: "teacher", email });
    toast("Welcome Teacher ✅");
    setTimeout(() => (window.location.href = "dashboard.html"), 700);
    return;
  }

  toast("Invalid login ❌");
});
