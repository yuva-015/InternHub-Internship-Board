
"use strict";

// InternHub Student Authentication Frontend

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const authMessage = document.getElementById("authMessage");
const submitBtn = document.getElementById("submitBtn");

function showMessage(message, type = "error") {
  if (!authMessage) return;

  authMessage.textContent = message;
  authMessage.className = `auth-message ${type}`;
}

function setLoading(loading, defaultText) {
  if (!submitBtn) return;

  submitBtn.disabled = loading;
  submitBtn.textContent = loading ? "Please wait..." : defaultText;
}

async function sendAuthRequest(endpoint, data) {
  const response = await fetch(`/api/auth/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "same-origin",
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Something went wrong.");
  }

  return result;
}

// Student Signup
if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword =
      document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      showMessage("Passwords do not match.");
      return;
    }

    if (new TextEncoder().encode(password).length > 72) {
      showMessage("Password must be no more than 72 bytes.");
      return;
    }

    setLoading(true, "Create Account");
    showMessage("");

    try {
      await sendAuthRequest("signup", {
        name,
        email,
        password
      });

      signupForm.reset();
      showMessage(
        "Account created successfully! Redirecting to login...",
        "success"
      );

      window.location.assign("/login.html");
    } catch (error) {
      showMessage(error.message);
    } finally {
      setLoading(false, "Create Account");
    }
  });
}

// Student Login
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    setLoading(true, "Log In");
    showMessage("");

    try {
      await sendAuthRequest("login", {
        email,
        password
      });

      showMessage("Login successful! Redirecting...", "success");

      // Dashboard integration comes in a later step.
      window.location.assign("/dashboard.html");
    } catch (error) {
      showMessage(error.message);
    } finally {
      setLoading(false, "Log In");
    }
  });
}
