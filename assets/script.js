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

  // ===== Initialize Table Filter (only if table exists) =====
  initResearchTableFilter();
  
  // Initialize team filter
  initTeamFilter();
});

// ===== RESEARCH TABLE TAG FILTERING (inline clickable tags) =====
function initResearchTableFilter() {
  // Exit if table elements don't exist
  const clickableTags = document.querySelectorAll('.clickable-filter');
  const clearBtn = document.getElementById('clear-filters');
  const clearBtnSmall = document.getElementById('clear-filters-small');
  const tableRows = document.querySelectorAll('.research-row');
  const visibleCount = document.getElementById('visible-count');
  const activeFiltersBar = document.getElementById('active-filters-bar');
  const activeFiltersList = document.getElementById('active-filters-list');
  
  if (clickableTags.length === 0 || tableRows.length === 0) return;
  
  let activeFilters = {
    sdg: [],
    topic: [],
    type: []
  };
  
  // Handle clicks on inline tags
  clickableTags.forEach(tag => {
    tag.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent row click interference
      
      const filter = this.dataset.filter;
      const group = this.dataset.group;
      const displayLabel = this.textContent.trim();
      
      // Toggle this specific filter
      const groupFilters = activeFilters[group];
      const index = groupFilters.indexOf(filter);
      
      if (index === -1) {
        // Add filter
        groupFilters.push(filter);
        this.classList.add('active');
      } else {
        // Remove filter
        groupFilters.splice(index, 1);
        this.classList.remove('active');
      }
      
      // Update UI
      updateActiveFiltersBar();
      applyFilters();
    });
  });
  
  // Clear all filters - main button
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAllFilters);
  }
  
  // Clear all filters - small button in active bar
  if (clearBtnSmall) {
    clearBtnSmall.addEventListener('click', clearAllFilters);
  }
  
  // Clear individual filter from active bar
  function removeActiveFilter(group, filter) {
    activeFilters[group] = activeFilters[group].filter(f => f !== filter);
    
    // Remove active class from corresponding tag
    document.querySelectorAll(`.clickable-filter[data-group="${group}"][data-filter="${filter}"]`)
      .forEach(tag => tag.classList.remove('active'));
    
    updateActiveFiltersBar();
    applyFilters();
  }
  
  // Update the active filters display bar
  function updateActiveFiltersBar() {
    const allActive = [
      ...activeFilters.sdg.map(f => ({ group: 'sdg', filter: f })),
      ...activeFilters.topic.map(f => ({ group: 'topic', filter: f })),
      ...activeFilters.type.map(f => ({ group: 'type', filter: f }))
    ];
    
    if (allActive.length === 0) {
      if (activeFiltersBar) activeFiltersBar.style.display = 'none';
      return;
    }
    
    if (activeFiltersBar) activeFiltersBar.style.display = 'flex';
    
    if (activeFiltersList) {
      activeFiltersList.innerHTML = allActive.map(item => {
        const label = item.filter.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `
          <span class="active-filter-chip">
            ${label}
            <span class="remove-filter" data-group="${item.group}" data-filter="${item.filter}">×</span>
          </span>
        `;
      }).join('');
      
      // Add click handlers to remove buttons
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
    // Reset state
    activeFilters = { sdg: [], topic: [], type: [] };
    
    // Remove active classes from all tags
    clickableTags.forEach(tag => tag.classList.remove('active'));
    
    // Update UI
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
      
      // Check each group: if filters exist, row must match AT LEAST ONE (OR logic within group)
      // If no filters in group, it passes automatically
      const typeMatch = activeFilters.type.length === 0 || activeFilters.type.includes(rowType);
      
      const sdgMatch = activeFilters.sdg.length === 0 || 
        activeFilters.sdg.some(filter => rowSdgs.includes(filter));
      
      const topicMatch = activeFilters.topic.length === 0 || 
        activeFilters.topic.some(filter => rowTopics.includes(filter));
      
      // Row shows only if ALL groups match (AND logic between groups)
      if (typeMatch && sdgMatch && topicMatch) {
        row.classList.remove('filtered');
        visible++;
      } else {
        row.classList.add('filtered');
      }
    });
    
    // Update counter
    if (visibleCount) {
      visibleCount.textContent = visible;
    }
  }
  
  // Initialize
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