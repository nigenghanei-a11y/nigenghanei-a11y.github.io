// ===== D3 SVG ANIMATION =====
const svg = d3.select("#svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");

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

// Draw links (behind nodes)
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

    // Bounce off walls
    if (d.x < d.r || d.x > width - d.r) d.vx *= -1;
    if (d.y < d.r || d.y > height - d.r) d.vy *= -1;
  });

  // Update links
  linkEls
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

  // Update nodes
  nodeEls
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

  // Update labels
  labelEls
    .attr("x", d => d.x + d.r + 2)
    .attr("y", d => d.y + 3);
});

// ===== MOBILE TOGGLE =====
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const searchToggle = document.querySelector(".nav-search-toggle");
const navSearch = document.querySelector(".nav-search");

// Debug: Check if elements exist
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

// ===== SEARCH FUNCTIONALITY =====
if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
      alert("Search: " + query);
      // Or redirect: window.location.href = `search.html?q=${encodeURIComponent(query)}`;
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