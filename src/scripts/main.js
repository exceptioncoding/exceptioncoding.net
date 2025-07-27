// Particle system
function createParticles() {
  const particlesContainer = document.getElementById("particles");
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.animationDuration = Math.random() * 10 + 5 + "s";
    particle.style.animationDelay = Math.random() * 5 + "s";
    particlesContainer.appendChild(particle);
  }
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Scroll reveal animation
function revealOnScroll() {
  const reveals = document.querySelectorAll(".scroll-reveal");

  reveals.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;

    if (elementTop < window.innerHeight - elementVisible) {
      element.classList.add("revealed");
    }
  });
}

// GitHub Data Integration - Load from pre-generated JSON file

async function loadGitHubData() {
  try {
    console.log("📁 Loading GitHub data from JSON file...");
    const response = await fetch("./data/github-data.json");

    if (!response.ok) {
      throw new Error(`Failed to load GitHub data: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ GitHub data loaded successfully");
    console.log(`📊 Featured repositories: ${data.repositories.filter(r => r.isPinned).length}`);
    console.log(`📈 Public repositories: ${data.repositories.length}`);

    return data;
  } catch (error) {
    console.warn(
      "⚠️ Failed to load GitHub data from JSON file:",
      error.message
    );
    console.log('💡 Run "npm run fetch-github" to generate the data file');

    // Return fallback data structure
    return {
      repositories: []
    };
  }
}

function generateProjectCard(repo, type = 'featured') {
  // Map common languages to tech tags
  const languageMap = {
    JavaScript: "JavaScript",
    TypeScript: "TypeScript",
    Go: "Go",
    Java: "Java",
    Python: "Python",
    Rust: "Rust",
    HTML: "HTML5",
    CSS: "CSS3",
    Shell: "Shell",
    Dockerfile: "Docker",
  };

  // Create tech tags from language and topics
  const techTags = [];
  if (repo.language && languageMap[repo.language]) {
    techTags.push(languageMap[repo.language]);
  }

  // Add topics as tech tags (limit to 4 more for featured, 2 for recent)
  const topicLimit = type === 'featured' ? 4 : 2;
  repo.topics.slice(0, topicLimit).forEach((topic) => {
    const formattedTopic =
      topic.charAt(0).toUpperCase() + topic.slice(1).replace("-", " ");
    techTags.push(formattedTopic);
  });

  // Create tech tags HTML
  const techTagsHTML = techTags
    .map((tag) => `<span class="tech-tag">${tag}</span>`)
    .join("");

  // Format repository name for display
  const displayName = repo.name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  // Prepare links
  const codeLink = `<a href="${repo.htmlUrl}" class="project-link primary" target="_blank">View Code</a>`;
  const demoLink =
    repo.homepage && repo.homepage.trim()
      ? `<a href="${repo.homepage}" class="project-link secondary" target="_blank">Live Demo</a>`
      : "";

  // Add activity info for recent repos
  const activityInfo = type === 'recent' ? `
    <div class="project-activity">
      <span class="activity-date">Updated ${formatDate(repo.updatedAt)}</span>
      ${repo.stargazersCount > 0 ? `<span class="activity-stars">⭐ ${repo.stargazersCount}</span>` : ''}
    </div>
  ` : '';

  const cardClass = type === 'recent' ? 'project-card recent-card scroll-reveal' : 'project-card scroll-reveal';

  return `
                <div class="${cardClass}">
                    <div class="project-content">
                        <h3 class="project-title">${displayName}</h3>
                        <p class="project-description">${repo.description}</p>
                        <div class="project-tech">
                            ${techTagsHTML}
                        </div>
                        ${activityInfo}
                        <div class="project-links">
                            ${codeLink}
                            ${demoLink}
                        </div>
                    </div>
                </div>
            `;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
}

function updateProjectShowcase(featuredRepos, recentRepos = []) {
  const showcaseContainer = document.querySelector(".projects-showcase");
  const noProjectsMessage = document.querySelector(".no-projects-message");

  if (!showcaseContainer) return;

  let content = "";

  // Featured repositories section
  if (featuredRepos && featuredRepos.length > 0) {
    content += `
      <div class="featured-section">
        <h3 class="subsection-title">Featured Projects</h3>
        <div class="featured-grid">
          ${featuredRepos.map((repo) => generateProjectCard(repo, 'featured')).join("")}
        </div>
      </div>
    `;
  }

  // Recent repositories section
  if (recentRepos && recentRepos.length > 0) {
    content += `
      <div class="recent-section">
        <h3 class="subsection-title">Recent Activity</h3>
        <div class="recent-grid">
          ${recentRepos.map((repo) => generateProjectCard(repo, 'recent')).join("")}
        </div>
      </div>
    `;
  }

  if (content) {
    // Hide the no projects message
    if (noProjectsMessage) {
      noProjectsMessage.style.display = "none";
    }

    showcaseContainer.innerHTML = content + (noProjectsMessage ? noProjectsMessage.outerHTML : "");

    // Re-apply scroll reveal to new elements
    const newCards = showcaseContainer.querySelectorAll(".scroll-reveal");
    newCards.forEach((card) => {
      const elementTop = card.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        card.classList.add("revealed");
      }
    });
  } else {
    // Show the no projects message
    showcaseContainer.innerHTML = `
      <div class="no-projects-message" style="text-align: center; padding: 4rem 2rem; color: var(--text-secondary);">
        <h3>No Projects Found</h3>
        <p>Run <code>npm run fetch-github</code> to load projects from GitHub</p>
      </div>
    `;
  }
}

async function fetchGitHubData() {
  try {
    // Load GitHub data from JSON file
    const data = await loadGitHubData();

    // Update the UI with the data
    document.getElementById("repos-count").textContent = data.repositories.length;

    // Get featured and recent repositories from the same array
    const featuredRepos = data.repositories ? data.repositories.filter(repo => repo.isPinned) : [];
    const recentRepos = data.repositories ? data.repositories.filter(repo => !repo.isPinned).slice(0, 5) : [];

    // Update project showcase with featured and recent repositories
    if (featuredRepos.length > 0) {
      document.getElementById("featured-count").textContent = featuredRepos.length;
      updateProjectShowcase(featuredRepos, recentRepos);
    } else {
      console.log("No featured repositories found, showing recent repos only");
      document.getElementById("featured-count").textContent = "0";
      updateProjectShowcase([], recentRepos);
    }

    // Avatar images use static local file - no need for dynamic data
  } catch (error) {
    console.error("❌ Failed to load GitHub data:", error);
    // Show fallback values
    document.getElementById("repos-count").textContent = "0";
    document.getElementById("featured-count").textContent = "0";
    updateProjectShowcase([], []);
  }
}

// Theme toggle functionality with custom switch
const themeToggle = document.getElementById("themeToggle");
// Check for saved theme preference or default to dark mode
const currentTheme = localStorage.getItem("theme") || "dark";
function setThemeSwitch(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.setAttribute("aria-checked", "true");
    themeToggle.setAttribute("title", "Switch to light theme");
  } else {
    document.body.classList.remove("dark-theme");
    themeToggle.setAttribute("aria-checked", "false");
    themeToggle.setAttribute("title", "Switch to dark theme");
  }
}
// Initialize theme switch based on current state
setThemeSwitch(currentTheme);
themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-theme");
  const theme = isDark ? "dark" : "light";
  localStorage.setItem("theme", theme);
  setThemeSwitch(theme);
});

// Typing animation
function typeWriter() {
  const texts = [
    "Building the future, one exception at a time...",
    "Crafting exceptional digital experiences...",
    "Turning coffee into clean code...",
    "Solving complex problems with elegant solutions...",
  ];
  let textIndex = 0;
  let charIndex = 0;
  const typingElement = document.getElementById("typing-text");

  function type() {
    if (charIndex < texts[textIndex].length) {
      typingElement.textContent = texts[textIndex].substring(0, charIndex + 1);
      charIndex++;
      setTimeout(type, 100);
    } else {
      setTimeout(() => {
        charIndex = 0;
        textIndex = (textIndex + 1) % texts.length;
        setTimeout(type, 500);
      }, 2000);
    }
  }

  type();
}

// Easter egg - Konami code
let konamiCode = [];
const konamiSequence = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

document.addEventListener("keydown", (e) => {
  konamiCode.push(e.code);
  if (konamiCode.length > konamiSequence.length) {
    konamiCode.shift();
  }

  if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
    // Rainbow animation
    document.body.style.animation = "rainbow 2s ease-in-out";
    setTimeout(() => {
      document.body.style.animation = "";
    }, 2000);
  }
});

// Add rainbow animation
const style = document.createElement("style");
style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                25% { filter: hue-rotate(90deg); }
                50% { filter: hue-rotate(180deg); }
                75% { filter: hue-rotate(270deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
document.head.appendChild(style);

// Initialize everything
window.addEventListener("load", () => {
  createParticles();
  fetchGitHubData();
  typeWriter();
  revealOnScroll();
});

window.addEventListener("scroll", revealOnScroll);
