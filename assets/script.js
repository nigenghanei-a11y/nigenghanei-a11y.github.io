// ===== D3 SVG ANIMATION (runs immediately, safe if #svg doesn't exist) =====
const svg = d3.select("#svg");
let width = 0, height = 0;

if (!svg.empty()) {
  width = +svg.attr("width");
  height = +svg.attr("height");

  // Color scale
  const colorByGroup = d3.scaleOrdinal()
    .domain([0, 1, 2])
    .range(["#FF6A00", "#2b6cb0", "#f9ac85"]);

  // Drag behavior
  const drag = d3.drag()
    .on("start", (event) => {
      d3.select(event.sourceEvent.target).raise();
    })
    .on("drag", (event, d) => {
      d.x = event.x;
      d.y = event.y;
    });

  // Nodes
  const numNodes = 50;
  const nodes = d3.range(numNodes).map(i => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    r: 20 + Math.random() * 6,
    group: Math.floor(Math.random() * 3)
  }));

  // Links
  const numLinks = 30;
  const links = d3.range(numLinks).map(() => ({
    source: nodes[Math.floor(Math.random() * nodes.length)],
    target: nodes[Math.floor(Math.random() * nodes.length)]
  }));

  // Draw links
  const linkEls = svg.append("g")
    .attr("stroke", "#0008ff")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("stroke-width", 1.2);

  // Draw nodes
  const nodeEls = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("r", d => d.r)
    .attr("fill", d => colorByGroup(d.group))
    .attr("stroke", "#ce8d33")
    .attr("stroke-width", 1.5)
    .call(drag);

  // Labels
  const labelEls = svg.append("g")
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .text(d => d.id)
    .attr("font-size", "10px")
    .attr("fill", "#68b4ae")
    .attr("pointer-events", "none");

  // Animation loop
  d3.timer(() => {
    nodes.forEach(d => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < d.r || d.x > width - d.r) d.vx *= -1;
      if (d.y < d.r || d.y > height - d.r) d.vy *= -1;
    });

    linkEls
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    nodeEls
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    labelEls
      .attr("x", d => d.x + d.r + 2)
      .attr("y", d => d.y + 3);
    });
}

// ===== NAVBAR & SEARCH TOGGLE (runs after DOM is ready) =====
document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const searchToggle = document.querySelector(".nav-search-toggle");
  const navSearch = document.querySelector(".nav-search");

  // Debug (remove in production)
  console.log("Nav toggle:", navToggle);
  console.log("Nav links:", navLinks);
  console.log("Search toggle:", searchToggle);
  console.log("Nav search:", navSearch);

  // Hamburger menu toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("Menu toggle clicked!");
      navLinks.classList.toggle("active");
      if (navSearch) navSearch.classList.remove("active");
    });
  }

  // Search toggle
  if (searchToggle && navSearch) {
    searchToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("Search toggle clicked!");
      navSearch.classList.toggle("active");
      if (navLinks) navLinks.classList.remove("active");
      if (searchInput) searchInput.focus();
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-right")) {
      if (navLinks) navLinks.classList.remove("active");
      if (navSearch) navSearch.classList.remove("active");
    }
  });

  // Search functionality
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query) {
        alert("Search: " + query);
      } else {
        alert("Please type something to search!");
      }
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchBtn.click();
      }
    });
  }
});

// ===== PUBLICATION FILTER =====
const filterBtns = document.querySelectorAll(".filter-btn");
const pubCards = document.querySelectorAll(".pub-card");

if (filterBtns.length > 0 && pubCards.length > 0) {
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const filter = btn.dataset.filter;
      
      // Filter cards
      pubCards.forEach(card => {
        const type = card.dataset.type;
        if (filter === "all" || type === filter) {
          card.style.display = "block";
          // Add fade-in animation
          card.style.animation = "fadeInUp 0.4s ease-out forwards";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}