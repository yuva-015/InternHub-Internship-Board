"use strict";
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
let internships = [];
function showState(state) {
  loadingState.hidden = state !== "loading";
  errorState.hidden = state !== "error";
  emptyState.hidden = state !== "empty";
  list.hidden = state !== "ready";
}
function makeElement(tag, text, className = "") {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) {
    element.className = className;
  }
  return element;
}
async function loadInternships() {
  showState("loading");
  resultsCount.textContent = "";
  list.replaceChildren();
  try {
    const response = await fetch("data/internships.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Unable to fetch internship records");
    }

    const json = await response.json();

    if (!json || !Array.isArray(json.internships)) {
      throw new Error("Invalid internship data format");
    }

    const ids = new Set();

    for (const item of json.internships) {
      if (
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

    internships = json.internships;

    populateFilters();
    renderInternships();

  } catch (error) {
    console.error("Internship loading failed:", error.message);
    internships = [];
    showState("error");
    resultsCount.textContent = "Internships could not be loaded.";
  }
}

// Populate filters from real data
function populateFilters() {
  domainFilter.replaceChildren(
    new Option("All Domains", "all")
  );

  modeFilter.replaceChildren(
    new Option("All Modes", "all")
  );

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

// Filter internships
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

    const matchesDomain =
      domain === "all" || item.domain === domain;

    const matchesMode =
      mode === "all" || item.mode === mode;

    return matchesSearch && matchesDomain && matchesMode;
  });
}

// Create one reusable internship card
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

// Internship details dialog
function openDetails(item) {
  dialogBody.replaceChildren();

  const domain = makeElement(
    "p",
    `Domain: ${item.domain}`
  );

  const mode = makeElement(
    "p",
    `Work Mode: ${item.mode}`
  );

  const location = makeElement(
    "p",
    `Location: ${item.location}`
  );

  const openings = makeElement(
    "p",
    `Openings: ${item.openings}`
  );

  const id = makeElement(
    "p",
    `Internship ID: ${item.id}`
  );

  const skillsHeading = makeElement(
    "h3",
    "Required Skills"
  );

  const skillsList = document.createElement("ul");

  item.skills.forEach(skill => {
    skillsList.appendChild(makeElement("li", skill));
  });

  document.getElementById("dialog-title").textContent =
    item.title;

  dialogBody.append(
    domain,
    mode,
    location,
    openings,
    id,
    skillsHeading,
    skillsList
  );

  if (!dialog.open) {
    dialog.showModal();
  }
}

// Close dialog
closeDialog.addEventListener("click", () => {
  dialog.close();
});

// Search as user types
searchInput.addEventListener("input", renderInternships);

// Filter changes
domainFilter.addEventListener("change", renderInternships);
modeFilter.addEventListener("change", renderInternships);

// Prevent form navigation
filterForm.addEventListener("submit", event => {
  event.preventDefault();
  renderInternships();
});

// Clear filters
filterForm.addEventListener("reset", () => {
  setTimeout(renderInternships, 0);
});

// Retry failed loading
retryButton.addEventListener("click", loadInternships);

// Start application
loadInternships();
