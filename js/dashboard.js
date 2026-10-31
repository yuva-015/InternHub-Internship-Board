
"use strict";

const loading = document.getElementById("dashboardLoading");
const content = document.getElementById("dashboardContent");
const studentName = document.getElementById("studentName");
const studentEmail = document.getElementById("studentEmail");
const logoutBtn = document.getElementById("logoutBtn");
const message = document.getElementById("dashboardMessage");
const applicationsMessage = document.getElementById("applicationsMessage");

async function loadApplications() {
  applicationsMessage.textContent = "Loading your applications...";

  try {
    const response = await fetch("/api/my-applications", {
      credentials: "same-origin",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Unable to load applications.");
    }

    const result = await response.json();
    const applications = result.data || [];

    if (applications.length === 0) {
      applicationsMessage.textContent =
        "You haven't applied for any internships yet.";
      return;
    }

    applicationsMessage.textContent =
      `You have ${applications.length} application(s).`;

    const list = document.createElement("div");
    list.className = "applications-list";

    applications.forEach((application) => {
      const card = document.createElement("div");
      card.className = "application-card";

      const title = document.createElement("h4");
      title.textContent = application.internshipTitle;

      const details = document.createElement("p");
      details.textContent =
        `${application.domain} | ${application.mode} | ${application.location}`;

      const status = document.createElement("p");
      status.textContent = `Status: ${application.status}`;

      card.append(title, details, status);
      list.appendChild(card);
    });

    applicationsMessage.after(list);
  } catch (error) {
    applicationsMessage.textContent = error.message;
  }
}

async function loadStudentProfile() {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "same-origin",
      cache: "no-store"
    });

    if (response.status === 401) {
      window.location.replace("/login.html");
      return;
    }

    if (!response.ok) {
      throw new Error("Unable to load student profile.");
    }

    const result = await response.json();

    studentName.textContent = `Welcome, ${result.data.name}!`;
    studentEmail.textContent = result.data.email;

    loading.hidden = true;
    content.hidden = false;

    await loadApplications();
  } catch (error) {
    loading.textContent =
      "Unable to load your dashboard. Please refresh and try again.";
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    logoutBtn.disabled = true;
    message.textContent = "";

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin"
      });

      if (!response.ok) {
        throw new Error("Logout failed. Please try again.");
      }

      window.location.replace("/login.html");
    } catch (error) {
      message.textContent = error.message;
      message.className = "auth-message error";
      logoutBtn.disabled = false;
    }
  });
}

loadStudentProfile();
