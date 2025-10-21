function loadCSV(filePath, button = null) {
  Papa.parse(filePath, {
    download: true,
    header: true,
    complete: function(results) {
      const data = results.data.filter(row => Object.values(row).some(v => v));
      if (!data.length) {
        document.getElementById("csv-table").innerHTML = "<p>No data available.</p>";
        return;
      }
      let html = "<table>";
      html += "<thead><tr>";
      html += Object.keys(data[0]).map(h => `<th>${h}</th>`).join("");
      html += "</tr></thead><tbody>";
      data.forEach(row => {
        html += "<tr>" + Object.values(row).map(v => `<td>${v || ""}</td>`).join("") + "</tr>";
      });
      html += "</tbody></table>";
      document.getElementById("csv-table").innerHTML = html;
      if (button) {
        document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
        button.classList.add("active");
      }
    }
  });
}
function filterTable() {
  const input = document.getElementById("searchInput");
  const filter = input.value.toLowerCase();
  const table = document.getElementById("data-table");
  const rows = table.getElementsByTagName("tr");

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");
    let match = false;

    for (let j = 0; j < cells.length; j++) {
      if (cells[j].innerText.toLowerCase().includes(filter)) {
        match = true;
        break;
      }
    }

    rows[i].style.display = match ? "" : "none";
  }
}
