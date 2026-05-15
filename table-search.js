document.querySelectorAll(".table-search").forEach(input => {

  const table = document.querySelector(input.dataset.table);
  if (!table) return;

  const tbody = table.querySelector("tbody");
  const rows = [...tbody.querySelectorAll("tr")];

  let filteredRows = rows;

  function getRowHeight() {
    return rows[0] ? rows[0].offsetHeight : 40;
  }

  function updateTable() {
    const value = input.value.toLowerCase().trim();

    filteredRows = rows.filter(row =>
      row.textContent.toLowerCase().includes(value)
    );

    rows.forEach(row => {
      row.style.display = filteredRows.includes(row) ? "" : "none";
    });

    const rowHeight = getRowHeight();
    const maxHeight = rowHeight * 25;

    tbody.style.display = "block";
    tbody.style.maxHeight = `${maxHeight}px`;
    tbody.style.overflowY = filteredRows.length > 25 ? "auto" : "visible";

    table.querySelectorAll("thead, tbody tr").forEach(el => {
      el.style.display = "table";
      el.style.width = "100%";
      el.style.tableLayout = "fixed";
    });
  }

  input.addEventListener("input", updateTable);

  updateTable();

});
