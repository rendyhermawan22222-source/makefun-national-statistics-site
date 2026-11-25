// tables.js — one job: sortable, searchable tables. A table is described by
// columns [{key, label, numeric, format}] and rows of plain objects. Clicking
// a column header sorts by that column (numeric columns sort numerically);
// the search box filters rows by any visible text. Sorting state lives on
// the table element so re-renders keep it.

export function sortableTable(id, columns, rows, { searchPlaceholder = 'Search…' } = {}) {
  const head = columns
    .map((c) => `<th data-key="${c.key}" data-numeric="${c.numeric ? 1 : 0}" tabindex="0" role="button" aria-label="Sort by ${c.label}">${c.label} <span class="sort-arrow" aria-hidden="true">↕</span></th>`)
    .join('');
  const body = rows
    .map((r) => `<tr>${columns.map((c) => `<td${c.numeric ? ' class="num"' : ''}>${c.format ? c.format(r[c.key], r) : r[c.key]}</td>`).join('')}</tr>`)
    .join('');
  return `<div class="table-tools"><label class="search-box">Search <input type="search" id="${id}-search" placeholder="${searchPlaceholder}" aria-label="${searchPlaceholder}"></label><span class="row-count" id="${id}-count">${rows.length} rows</span></div>
<table class="data-table" id="${id}" data-sort-key="" data-sort-dir="1"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
<p class="table-hint">Click a column heading to sort. Click again to reverse.</p>`;
}

// Wire sorting + search for a table rendered by sortableTable.
export function wireTable(id) {
  const table = document.getElementById(id);
  if (!table) return;
  const search = document.getElementById(id + '-search');
  const count = document.getElementById(id + '-count');
  const tbody = table.querySelector('tbody');
  const headers = [...table.querySelectorAll('th')];

  function apply() {
    const key = table.dataset.sortKey;
    const dir = Number(table.dataset.sortDir || 1);
    const q = (search?.value || '').trim().toLowerCase();
    let rows = [...tbody.querySelectorAll('tr')];
    if (q) {
      rows = rows.filter((tr) => tr.textContent.toLowerCase().includes(q));
      [...tbody.querySelectorAll('tr')].forEach((tr) => {
        tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    } else {
      [...tbody.querySelectorAll('tr')].forEach((tr) => { tr.style.display = ''; });
    }
    if (key) {
      const idx = headers.findIndex((th) => th.dataset.key === key);
      const numeric = headers[idx]?.dataset.numeric === '1';
      const visible = rows.slice();
      visible.sort((a, b) => {
        const av = a.children[idx].textContent.trim();
        const bv = b.children[idx].textContent.trim();
        const cmp = numeric
          ? (parseFloat(av.replace(/[^0-9.\-]/g, '')) || 0) - (parseFloat(bv.replace(/[^0-9.\-]/g, '')) || 0)
          : av.localeCompare(bv, 'id');
        return cmp * dir;
      });
      visible.forEach((tr) => tbody.appendChild(tr));
      headers.forEach((th) => {
        th.querySelector('.sort-arrow').textContent = th.dataset.key === key ? (dir === 1 ? '↑' : '↓') : '↕';
      });
    }
    if (count) {
      const shown = [...tbody.querySelectorAll('tr')].filter((tr) => tr.style.display !== 'none').length;
      count.textContent = shown + ' of ' + tbody.querySelectorAll('tr').length + ' rows';
    }
  }

  headers.forEach((th) => {
    const sort = () => {
      if (table.dataset.sortKey === th.dataset.key) {
        table.dataset.sortDir = String(-Number(table.dataset.sortDir || 1));
      } else {
        table.dataset.sortKey = th.dataset.key;
        table.dataset.sortDir = '1';
      }
      apply();
    };
    th.addEventListener('click', sort);
    th.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sort(); } });
  });
  search?.addEventListener('input', apply);
}
