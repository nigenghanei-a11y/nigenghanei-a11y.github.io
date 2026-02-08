const svg = d3.select("#svg");
const width = +svg.attr("width");
const height = +svg.attr("height");



const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");

// Generate many circles and lines dynamically
/*const numCircles = 20; // number of circles
const numLines = 10;   // number of lines

const shapes = [];

// Create circles with random positions and velocities
for (let i = 0; i < numCircles; i++) {
  shapes.push({
    type: "circle",
    cx: Math.random() * width,
    cy: Math.random() * height,
    r: 10 + Math.random() * 20, // radius between 10 and 30
    fill: `hsl(${Math.random() * 360}, 70%, 50%)`,
    vx: (Math.random() - 0.5) * 4, // random velocity
    vy: (Math.random() - 0.5) * 4
  });
}

// Create lines with random positions and velocities
for (let i = 0; i < numLines; i++) {
  shapes.push({
    type: "line",
    x1: Math.random() * width,
    y1: Math.random() * height,
    x2: Math.random() * width,
    y2: Math.random() * height,
    stroke: `hsl(${Math.random() * 360}, 70%, 50%)`,
    strokeWidth: 2 + Math.random() * 3,
    vx1: (Math.random() - 0.5) * 3,
    vy1: (Math.random() - 0.5) * 3,
    vx2: (Math.random() - 0.5) * 3,
    vy2: (Math.random() - 0.5) * 3
  });
}

// Create SVG elements
shapes.forEach(shape => {
  if (shape.type === "circle") {
    shape.el = svg.append("circle")
      .attr("cx", shape.cx)
      .attr("cy", shape.cy)
      .attr("r", shape.r)
      .attr("fill", shape.fill);
  } else if (shape.type === "line") {
    shape.el = svg.append("line")
      .attr("x1", shape.x1)
      .attr("y1", shape.y1)
      .attr("x2", shape.x2)
      .attr("y2", shape.y2)
      .attr("stroke", shape.stroke)
      .attr("stroke-width", shape.strokeWidth);
  }
});

// Animation loop
d3.timer(() => {
  shapes.forEach(d => {
    if (d.type === "circle") {
      d.cx += d.vx;
      d.cy += d.vy;

      if (d.cx - d.r < 0 || d.cx + d.r > width) d.vx *= -1;
      if (d.cy - d.r < 0 || d.cy + d.r > height) d.vy *= -1;

      d.el.attr("cx", d.cx).attr("cy", d.cy);
    } else if (d.type === "line") {
      d.x1 += d.vx1;
      d.y1 += d.vy1;
      d.x2 += d.vx2;
      d.y2 += d.vy2;

      if (d.x1 < 0 || d.x1 > width) d.vx1 *= -1;
      if (d.y1 < 0 || d.y1 > height) d.vy1 *= -1;
      if (d.x2 < 0 || d.x2 > width) d.vx2 *= -1;
      if (d.y2 < 0 || d.y2 > height) d.vy2 *= -1;

      d.el.attr("x1", d.x1).attr("y1", d.y1)
           .attr("x2", d.x2).attr("y2", d.y2);
    }
  });
});

*/

//The network animation
// Color scale
// --------------------
const colorByGroup = d3.scaleOrdinal()
  .domain([0, 1, 2])
  .range(["#FF6A00", "#2b6cb0", "#f9ac85"]); // orange, blue, orange

// --------------------
// Drag behavior
// --------------------
const drag = d3.drag()
  .on("start", (event) => {
    d3.select(event.sourceEvent.target).raise();
  })
  .on("drag", (event, d) => {
    d.x = event.x;
    d.y = event.y;
  });

// --------------------
// Nodes
// --------------------
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

// --------------------
// Links
// --------------------
const numLinks = 30;

const links = d3.range(numLinks).map(() => ({
  source: nodes[Math.floor(Math.random() * nodes.length)],
  target: nodes[Math.floor(Math.random() * nodes.length)]
}));

// --------------------
// Draw links (behind nodes)
// --------------------
const linkEls = svg.append("g")
  .attr("stroke", "#0008ff")
  .attr("stroke-opacity", 0.6)
  .selectAll("line")
  .data(links)
  .enter()
  .append("line")
  .attr("stroke-width", 1.2);

// --------------------
// Draw nodes
// --------------------
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


  const labelEls = svg.append("g")
  .selectAll("text")
  .data(nodes)
  .enter()
  .append("text")
  .text(d => d.id)
  .attr("font-size", "10px")
  .attr("fill", "#68b4ae")
  .attr("pointer-events", "none"); // important!
// --------------------
// Animation loop
// --------------------
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
    
    labelEls
  .attr("x", d => d.x + d.r + 2)
  .attr("y", d => d.y + 3);

});
//end network animation



//toggle

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

const searchToggle = document.querySelector(".nav-search-toggle");
const navSearch = document.querySelector(".nav-search");

// Hamburger menu toggle
navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  // hide search if menu opens
  navSearch.classList.remove("active");
});

// Search toggle on mobile
searchToggle.addEventListener("click", () => {
  navSearch.classList.toggle("active");
  navLinks.classList.remove("active");
  searchInput.focus(); // Focus input when it appears
});



//search 

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if(query) {
    // Example: search page redirect
    // Replace 'search.html?q=' with your search handler if you have one
    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
  } else {
    alert("Please type something to search!");
  }
});

// Optional: allow Enter key to trigger search
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});


// Mobile menu toggle
document.querySelector('.nav-toggle').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('active');
});