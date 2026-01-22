const $ = (id) => document.getElementById(id);

function toast(msg) {
  const t = $("toast");
  if (!t) return;
  t.style.display = "block";
  t.textContent = msg;
  setTimeout(() => (t.style.display = "none"), 2200);
}

function setTheme(theme) {
  if (theme === "light") document.documentElement.classList.add("light");
  else document.documentElement.classList.remove("light");

  localStorage.setItem("theme", theme);

  const btn = $("themeToggle");
  if (btn) btn.textContent = theme === "light" ? "☀️ Light" : "🌙 Dark";
}

function initTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  setTheme(saved);

  const btn = $("themeToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const now = localStorage.getItem("theme") || "dark";
      setTheme(now === "dark" ? "light" : "dark");
    });
  }
}
