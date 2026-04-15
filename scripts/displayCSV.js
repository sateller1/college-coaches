const csvCache = new Map();
let filterDebounceId = null;
const PAGE_SIZE = 200;

let currentHeaders = [];
let currentRows = [];
let filteredRows = [];
let currentPage = 1;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderCurrentPage() {
  const container = document.getElementById("csv-table");
  if (!filteredRows.length) {
    container.innerHTML = '<p>No results match your search.</p>';
    return;
  }

  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  currentPage = Math.min(Math.max(1, currentPage), totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, totalRows);
  const visibleRows = filteredRows.slice(start, end);

  let html = "<table>";
  html += "<thead><tr>";
  html += currentHeaders.map(h => `<th>${escapeHtml(h)}</th>`).join("");
  html += "</tr></thead><tbody>";

  visibleRows.forEach(row => {
    html += "<tr>" + row.values.map(v => `<td>${escapeHtml(v)}</td>`).join("") + "</tr>";
  });

  html += "</tbody></table>";

  const showingText = `Showing ${start + 1}-${end} of ${totalRows}`;
  const prevDisabled = currentPage === 1 ? "disabled" : "";
  const nextDisabled = currentPage === totalPages ? "disabled" : "";

  container.innerHTML = `
    <div class="table-meta" style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
      <span>${showingText}</span>
      <div class="table-pagination" style="display:flex;align-items:center;gap:6px;">
        <button id="prev-page-btn" ${prevDisabled}>Prev</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button id="next-page-btn" ${nextDisabled}>Next</button>
      </div>
    </div>
    ${html}
  `;

  const prevBtn = document.getElementById("prev-page-btn");
  const nextBtn = document.getElementById("next-page-btn");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentPage -= 1;
      renderCurrentPage();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentPage += 1;
      renderCurrentPage();
    });
  }
}

function loadCSV(filePath, button = null) {
  const applyTabStyles = () => {
    if (!button) return;
    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
  };

  const cachedData = csvCache.get(filePath);
  if (cachedData) {
    currentHeaders = cachedData.headers;
    currentRows = cachedData.rows;
    applyTabStyles();
    applyFilterNow();
    return;
  }

  Papa.parse(filePath, {
    download: true,
    header: true,
    complete: function(results) {
      const data = results.data.filter(row => Object.values(row).some(v => v));
      if (!data.length) {
        document.getElementById("csv-table").innerHTML = "<p>No data available.</p>";
        return;
      }

      const headers = Object.keys(data[0]);
      const rows = data.map(row => {
        const values = headers.map(h => row[h] || "");
        return {
          values,
          searchBlob: values.join(" ").toLowerCase()
        };
      });

      csvCache.set(filePath, { headers, rows });
      currentHeaders = headers;
      currentRows = rows;
      applyTabStyles();
      applyFilterNow();
    }
  });
}

function applyFilterNow() {
  const input = document.getElementById("searchInput");
  const filter = (input?.value || "").toLowerCase().trim();
  filteredRows = filter
    ? currentRows.filter(row => row.searchBlob.includes(filter))
    : currentRows;
  currentPage = 1;
  renderCurrentPage();
}

function filterTable() {
  window.clearTimeout(filterDebounceId);
  filterDebounceId = window.setTimeout(applyFilterNow, 120);
}
