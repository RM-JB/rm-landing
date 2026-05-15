document.querySelectorAll(".table-search").forEach(input => {

  const table = document.querySelector(input.dataset.table);
  if (!table) return;

  const tbody = table.querySelector("tbody");
  const rows = [...tbody.querySelectorAll("tr")];

  const perPage = 25;
  let expanded = false;
  let filteredRows = rows;

  // Create button
  const showMoreBtn = document.createElement("button");

  showMoreBtn.className = "table-show-more";
  showMoreBtn.style.display = "block";
  showMoreBtn.style.marginInline = "auto";
  showMoreBtn.style.marginTop = "1rem";

  table.insertAdjacentElement("afterend", showMoreBtn);

  function updateTable() {

    // Hide all rows
    rows.forEach(row => {
      row.style.display = "none";
    });

    // Decide how many rows to show
    const visibleCount = expanded
      ? filteredRows.length
      : perPage;

    // Show rows
    filteredRows.slice(0, visibleCount).forEach(row => {
      row.style.display = "";
    });

    // Button logic
    if (filteredRows.length <= perPage) {

      showMoreBtn.style.display = "none";

    } else {

      showMoreBtn.style.display = "block";
      showMoreBtn.textContent = expanded
        ? "Show Less"
        : "Show More";
    }
  }

  // Search
  input.addEventListener("input", () => {

    const value = input.value.toLowerCase().trim();

    filteredRows = rows.filter(row =>
      row.textContent.toLowerCase().includes(value)
    );

    // Reset collapsed state after search
    expanded = false;

    updateTable();
  });

  // Toggle button
  showMoreBtn.addEventListener("click", () => {

    expanded = !expanded;

    updateTable();

    // Optional: scroll back to table when collapsing
    if (!expanded) {
      table.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

  });

  // Initial state
  updateTable();

});
