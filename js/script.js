
"use strict";

// InternHub TASK-3: Frontend API Integration + Application Form

const list = document.getElementById("internship-list");
const searchInput = document.getElementById("search-input");
const domainFilter = document.getElementById("domain-filter");
const modeFilter = document.getElementById("mode-filter");
const filterForm = document.getElementById("filter-form");

const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const emptyState = document.getElementById("empty-state");
const resultsCount = document.getElementById("results-count");
const retryButton = document.getElementById("retry-btn");

const dialog = document.getElementById("details-dialog");
const dialogBody = document.getElementById("dialog-body");
const closeDialog = document.getElementById("close-dialog");

const applyNowButton = document.getElementById("apply-now-btn");
const applicationDialog = document.getElementById("application-dialog");
const closeApplication = document.getElementById("close-application");
const applicationForm = document.getElementById("application-form");
const selectedInternshipText = document.getElementById("selected-internship");
const applicationInternshipId = document.getElementById("application-internship-id");
const applicationMessage = document.getElementById("application-message");
const submitApplicationButton = document.getElementById("submit-application");

const API_URL = "/api/internships";

let internships = [];
let selectedInternship = null;

// Show internship loading, error, empty or ready state
function showState(state) {
  loadingState.hidden = state !== "loading";
  errorState.hidden = state !== "error";
  emptyState.hidden = state !== "empty";
  list.hidden = state !== "ready";
}

// Create safe HTML elements
function makeElement(tag, text, className = "") {
  const element = document.createElement(tag);
  element.textContent = text;

  if (className) {
    element.className = className;
  }

  return element;
}

// Validate internship data from API
function validateInternships(records) {
  if (!Array.isArray(records)) {
    throw new Error("Invalid internship data format");
  }

  const ids = new Set();

  for (const item of records) {
    if (
      !item ||
      typeof item.id !== "string" ||
      typeof item.title !== "string" ||
      typeof item.domain !== "string" ||
      typeof item.mode !== "string" ||
      typeof item.location !== "string" ||
      !Array.isArray(item.skills) ||
      !item.skills.every(skill => typeof skill === "string") ||
      !Number.isInteger(item.openings) ||
      ids.has(item.id)
    ) {
      throw new Error("Invalid or duplicate internship record");
    }

    ids.add(item.id);
  }
}

// Load all internships from Express + SQLite API
async function loadInternships() {
  showState("loading");
  resultsCount.textContent = "";
  list.replaceChildren();

  try {
    const allRecords = [];
    let page = 1;
    let totalPages = 1;

    do {
      const response = await fetch(
        `${API_URL}?page=${page}&limit=100`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error(
          `Unable to fetch internships: HTTP ${response.status}`
        );
      }

      const json = await response.json();

      if (
        !json ||
        json.success !== true ||
        !Array.isArray(json.data) ||
        !json.pagination ||
        !Number.isInteger(json.pagination.totalPages) ||
        json.pagination.totalPages < 0
      ) {
        throw new Error("Invalid backend API response");
      }

      allRecords.push(...json.data);
      totalPages = json.pagination.totalPages;
      page += 1;
    } while (page <= totalPages);

    validateInternships(allRecords);

    internships = allRecords;
    populateFilters();
    renderInternships();

  } catch (error) {
    console.error("Internship loading failed:", error.message);

    internships = [];
    showState("error");
    resultsCount.textContent = "Internships could not be loaded.";
  }
}

// Populate filters
function populateFilters() {
  domainFilter.replaceChildren(new Option("All Domains", "all"));
  modeFilter.replaceChildren(new Option("All Modes", "all"));

  const domains = [...new Set(
    internships.map(item => item.domain)
  )].sort();

  const modes = [...new Set(
    internships.map(item => item.mode)
  )].sort();

  domains.forEach(domain => {
    domainFilter.add(new Option(domain, domain));
  });

  modes.forEach(mode => {
    modeFilter.add(new Option(mode, mode));
  });
}

// Search and filter
function getFilteredInternships() {
  const search = searchInput.value.trim().toLowerCase();
  const domain = domainFilter.value;
  const mode = modeFilter.value;

  return internships.filter(item => {
    const searchableText = [
      item.title,
      item.domain,
      item.location,
      item.id,
      ...item.skills
    ].join(" ").toLowerCase();

    const matchesSearch = searchableText.includes(search);
    const matchesDomain = domain === "all" || item.domain === domain;
    const matchesMode = mode === "all" || item.mode === mode;

    return matchesSearch && matchesDomain && matchesMode;
  });
}

// Create internship card
function createCard(item) {
  const card = document.createElement("article");
  card.className = "internship-card";

  const title = makeElement("h3", item.title);

  const company = makeElement(
    "p",
    "InternHub Demo Opportunity",
    "company-name"
  );

  const description = makeElement(
    "p",
    `Location: ${item.location}`,
    "card-description"
  );

  const tags = document.createElement("div");
  tags.className = "card-meta";

  [item.domain, item.mode].forEach(value => {
    tags.appendChild(makeElement("span", value, "tag"));
  });

  const openings = makeElement(
    "p",
    `Available openings: ${item.openings}`,
    "card-description"
  );

  const button = makeElement(
    "button",
    "View Details",
    "card-button"
  );

  button.type = "button";
  button.setAttribute(
    "aria-label",
    `View details for ${item.title}`
  );

  button.addEventListener("click", () => {
    openDetails(item);
  });

  card.append(
    title,
    company,
    description,
    tags,
    openings,
    button
  );

  return card;
}

// Render internship cards
function renderInternships() {
  const filtered = getFilteredInternships();
  list.replaceChildren();

  resultsCount.textContent =
    `${filtered.length} internship${filtered.length === 1 ? "" : "s"} found`;

  if (filtered.length === 0) {
    showState("empty");
    return;
  }

  const fragment = document.createDocumentFragment();

  filtered.forEach(item => {
    fragment.appendChild(createCard(item));
  });

  list.appendChild(fragment);
  showState("ready");
}

// Show internship details
function openDetails(item) {
  selectedInternship = item;
  dialogBody.replaceChildren();

  const domain = makeElement("p", `Domain: ${item.domain}`);
  const mode = makeElement("p", `Work Mode: ${item.mode}`);
  const location = makeElement("p", `Location: ${item.location}`);
  const openings = makeElement("p", `Openings: ${item.openings}`);
  const id = makeElement("p", `Internship ID: ${item.id}`);

  const skillsHeading = makeElement("h3", "Required Skills");
  const skillsList = document.createElement("ul");

  item.skills.forEach(skill => {
    skillsList.appendChild(makeElement("li", skill));
  });

  document.getElementById("dialog-title").textContent = item.title;

  dialogBody.append(
    domain,
    mode,
    location,
    openings,
    id,
    skillsHeading,
    skillsList
  );

  applyNowButton.disabled = item.openings === 0;
  applyNowButton.textContent =
    item.openings === 0 ? "No Openings Available" : "Apply Now";

  if (!dialog.open) {
    dialog.showModal();
  }
}

// Open application form
applyNowButton.addEventListener("click", () => {
  if (!selectedInternship || selectedInternship.openings === 0) {
    return;
  }

  applicationForm.reset();
  applicationMessage.textContent = "";

  applicationInternshipId.value = selectedInternship.id;

  selectedInternshipText.textContent =
    `Applying for: ${selectedInternship.title} (${selectedInternship.id})`;

  dialog.close();
  applicationDialog.showModal();
});

// Close internship details
closeDialog.addEventListener("click", () => {
  dialog.close();
});

// Close application form
closeApplication.addEventListener("click", () => {
  if (!submitApplicationButton.disabled) {
    applicationDialog.close();
  }
});

// Validate application form data
function validateApplication(data) {
  if (data.name.length < 2 || data.name.length > 100) {
    return "Name must contain 2 to 100 characters.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    data.email.length > 254 ||
    !emailPattern.test(data.email)
  ) {
    return "Enter a valid email address.";
  }

  if (data.college.length < 2 || data.college.length > 150) {
    return "College name must contain 2 to 150 characters.";
  }

  if (data.skills.length < 2 || data.skills.length > 500) {
    return "Skills must contain 2 to 500 characters.";
  }

  if (!/^INT-\d+$/.test(data.internshipId)) {
    return "Invalid internship selection.";
  }

  return null;
}

// Submit application to backend
applicationForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (!applicationForm.reportValidity()) {
    return;
  }

  const application = {
    internshipId: applicationInternshipId.value,
    name: document.getElementById("applicant-name").value.trim(),
    email: document.getElementById("applicant-email").value.trim(),
    college: document.getElementById("applicant-college").value.trim(),
    skills: document.getElementById("applicant-skills").value.trim()
  };

  const validationError = validateApplication(application);

  if (validationError) {
    applicationMessage.textContent = validationError;
    return;
  }

  submitApplicationButton.disabled = true;
  submitApplicationButton.textContent = "Submitting...";
  applicationMessage.textContent = "Submitting your application...";

  try {
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(application)
    });

    const result = await response.json();

    if (!response.ok || result.success !== true) {
      throw new Error(
        result.error || "Application submission failed."
      );
    }

    applicationMessage.textContent =
      "Application submitted successfully!";

    applicationForm.reset();

  } catch (error) {
    console.error("Application submission failed:", error.message);

    applicationMessage.textContent =
      error.message || "Unable to submit. Please try again.";

  } finally {
    submitApplicationButton.disabled = false;
    submitApplicationButton.textContent = "Submit Application";
  }
});

// Search as user types
searchInput.addEventListener("input", renderInternships);

// Filter changes
domainFilter.addEventListener("change", renderInternships);
modeFilter.addEventListener("change", renderInternships);

// Prevent filter form navigation
filterForm.addEventListener("submit", event => {
  event.preventDefault();
  renderInternships();
});

// Clear filters
filterForm.addEventListener("reset", () => {
  setTimeout(renderInternships, 0);
});

// Retry loading
retryButton.addEventListener("click", loadInternships);

// Start application
loadInternships();

