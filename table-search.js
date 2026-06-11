document.querySelectorAll(".table-search").forEach(input => {

  const table = document.querySelector(input.dataset.table);
  if (!table) return;

  const tbody = table.querySelector("tbody");
  if (!tbody) return;

  const rows = [...tbody.querySelectorAll("tr")];

  const parent = table.parentElement;

  // Create wrapper around table
  const wrapper = document.createElement("div");
  wrapper.className = "table-search-wrap";

  parent.insertBefore(wrapper, table);
  wrapper.appendChild(table);

  wrapper.style.position = "relative";
  wrapper.style.maxHeight = "75vh";
  wrapper.style.overflow = "auto";

  // Sticky headings
  const thead = table.querySelector("thead");

  if (thead) {
    thead.style.position = "sticky";
    thead.style.top = "0";
    thead.style.zIndex = "5";
  }

  function updateTable() {

    const value = input.value.toLowerCase().trim();

    rows.forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(value)
        ? ""
        : "none";
    });

  }

  input.addEventListener("input", updateTable);

  updateTable();

});
