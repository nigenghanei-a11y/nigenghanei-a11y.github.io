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

  // ===== Initialize filters =====
  initResearchTableFilter();
  initTeamFilter();
});

// ===== RESEARCH TABLE TAG FILTERING =====
function initResearchTableFilter() {
  const clickableTags = document.querySelectorAll('.clickable-filter');
  const clearBtnSmall = document.getElementById('clear-filters-small');
  const tableRows = document.querySelectorAll('.research-row');
  const visibleCount = document.getElementById('visible-count');
  const activeFiltersBar = document.getElementById('active-filters-bar');
  const activeFiltersList = document.getElementById('active-filters-list');
  
  // Exit if table doesn't exist on this page
  if (clickableTags.length === 0 || tableRows.length === 0) return;
  
  let activeFilters = {
    sdg: [],
    topic: [],
    type: []
  };
  
  // Handle clicks on inline tags (SDG, Topic, Type)
  clickableTags.forEach(tag => {
    tag.addEventListener('click', function(e) {
      e.stopPropagation();
      
      const filter = this.dataset.filter;
      const group = this.dataset.group;
      
      // Toggle this specific filter
      const groupFilters = activeFilters[group];
      const index = groupFilters.indexOf(filter);
      
      if (index === -1) {
        // Add filter
        groupFilters.push(filter);
        this.classList.add('active');
      } else {
        // Remove filter (click again to deselect)
        groupFilters.splice(index, 1);
        this.classList.remove('active');
      }
      
      updateActiveFiltersBar();
      applyFilters();
    });
  });
  
  // Clear all filters - small × button in active bar only
  if (clearBtnSmall) {
    clearBtnSmall.addEventListener('click', clearAllFilters);
  }
  
  // Remove individual filter from active bar chip
  function removeActiveFilter(group, filter) {
    activeFilters[group] = activeFilters[group].filter(f => f !== filter);
    
    // Remove active class from corresponding tag in table
    document.querySelectorAll(`.clickable-filter[data-group="${group}"][data-filter="${filter}"]`)
      .forEach(tag => tag.classList.remove('active'));
    
    updateActiveFiltersBar();
    applyFilters();
  }
  
  // Update the active filters display bar (shows below table)
  function updateActiveFiltersBar() {
    const allActive = [
      ...activeFilters.sdg.map(f => ({ group: 'sdg', filter: f })),
      ...activeFilters.topic.map(f => ({ group: 'topic', filter: f })),
      ...activeFilters.type.map(f => ({ group: 'type', filter: f }))
    ];
    
    // Hide bar if no active filters
    if (allActive.length === 0) {
      if (activeFiltersBar) activeFiltersBar.style.display = 'none';
      return;
    }
    
    // Show bar and populate with chips
    if (activeFiltersBar) activeFiltersBar.style.display = 'flex';
    
    if (activeFiltersList) {
      activeFiltersList.innerHTML = allActive.map(item => {
        // Format label: "sdg-3" → "SDG 3"
        const label = item.filter.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `
          <span class="active-filter-chip">
            ${label}
            <span class="remove-filter" data-group="${item.group}" data-filter="${item.filter}">×</span>
          </span>
        `;
      }).join('');
      
      // Add click handlers to × buttons on chips
      activeFiltersList.querySelectorAll('.remove-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const group = btn.dataset.group;
          const filter = btn.dataset.filter;
          removeActiveFilter(group, filter);
        });
      });
    }
  }
  
  // Clear all filters function
  function clearAllFilters() {
    activeFilters = { sdg: [], topic: [], type: [] };
    clickableTags.forEach(tag => tag.classList.remove('active'));
    if (activeFiltersBar) activeFiltersBar.style.display = 'none';
    if (activeFiltersList) activeFiltersList.innerHTML = '';
    applyFilters();
  }
  
  // Apply filters to table rows
  function applyFilters() {
    let visible = 0;
    
    tableRows.forEach(row => {
      const rowType = row.dataset.type;
      const rowSdgs = (row.dataset.sdgs || '').toLowerCase();
      const rowTopics = (row.dataset.topics || '').toLowerCase();
      
      // Filter logic:
      // - If no filters in a group → pass automatically
      // - If filters exist → row must match AT LEAST ONE in that group (OR logic)
      // - Row must pass ALL groups to show (AND logic between groups)
      
      const typeMatch = activeFilters.type.length === 0 || 
        activeFilters.type.includes(rowType);
      
      const sdgMatch = activeFilters.sdg.length === 0 || 
        activeFilters.sdg.some(filter => rowSdgs.includes(filter));
      
      const topicMatch = activeFilters.topic.length === 0 || 
        activeFilters.topic.some(filter => rowTopics.includes(filter));
      
      // Show/hide row based on all conditions
      if (typeMatch && sdgMatch && topicMatch) {
        row.classList.remove('filtered');
        row.style.display = '';
        visible++;
      } else {
        row.classList.add('filtered');
        row.style.display = 'none';
      }
    });
    
    // Update visible count
    if (visibleCount) {
      visibleCount.textContent = visible;
    }
  }
  
  // Initialize on load
  applyFilters();
}

// ===== TEAM FILTER FUNCTIONALITY =====
function initTeamFilter() {
  const teamFilterBtns = document.querySelectorAll(".team-filter-btn");
  const teamCards = document.querySelectorAll(".team-card-link");

  if (teamFilterBtns.length === 0 || teamCards.length === 0) return;

  teamFilterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // Update active button state
      teamFilterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const filter = btn.dataset.filter;
      
      // Filter team cards
      teamCards.forEach(card => {
        const category = card.dataset.category;
        if (filter === "all" || category === filter) {
          card.style.display = "block";
          card.style.animation = "fadeInUp 0.4s ease-out forwards";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}