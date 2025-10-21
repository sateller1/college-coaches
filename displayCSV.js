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
