// views.js — one job: turn the data in data.js into the HTML of each page.
// Every page is reached by a link in the header nav; every figure carries
// its source and year in the text next to it. No page is empty: each has
// charts, tables or cards with real figures in place.

import { AGE_GROUPS, CPI_GROUPS, EMPLOYMENT_SECTORS, LABOUR_FACTS, META, PROVINCES, SECTORS, SERIES, TRADE, ABOUT_FACTS, YEARS, headline } from './data.js';
import { barChart, donutChart, hbarChart, lineChart } from './charts.js';
import { sortableTable } from './tables.js';

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const fmt1 = (v) => v.toFixed(1);
const fmt2 = (v) => v.toFixed(2);
const fmtInt = (v) => Math.round(v).toLocaleString('en-US');

function sourceLine(text) {
  return `<p class="source">Source: ${esc(text)}</p>`;
}

function yearOptions(year) {
  return YEARS.map((y) => `<option value="${y}"${y === year ? ' selected' : ''}>${y}</option>`).join('');
}

export function yearPicker(year) {
  return `<label class="year-picker">Year <select id="year-select" aria-label="Choose a year">${yearOptions(year)}</select></label>`;
}

function cards(items) {
  return `<div class="cards">${items.map((c) => `<article class="card"><p class="card-value">${esc(c.value)}</p><h3>${esc(c.label)}</h3><p>${esc(c.sub)}</p><p class="source">Source: ${esc(c.source)}</p></article>`).join('')}</div>`;
}

function seriesPoints(key) {
  return YEARS.map((y) => ({ label: String(y), value: SERIES[key].values[y] }));
}

function chartBlock(title, chartHtml, source, note) {
  return `<section class="chart-block"><h2>${esc(title)}</h2>${chartHtml}${sourceLine(source)}${note ? `<p class="note">${esc(note)}</p>` : ''}</section>`;
}

// ---- Overview dashboard -------------------------------------------------
export function overview(year) {
  const cardsHtml = cards(headline(year));
  const pop = lineChart(seriesPoints('population'), { format: fmt1 });
  const gdp = barChart(seriesPoints('gdpGrowth'), { format: fmt2, unit: '%' });
  const top5 = [...PROVINCES].sort((a, b) => b.pop - a.pop).slice(0, 5);
  const provRows = top5.map((p) => `<tr><td>${esc(p.name)}</td><td class="num">${p.pop.toFixed(1)}</td><td>${esc(p.capital)}</td><td>${esc(p.island)}</td></tr>`).join('');
  return `<h1>Indonesia at a glance</h1>
<p class="lede">The headline numbers for the world’s fourth most populous country — population, economy, prices, work and poverty — with the source and year on every figure. Pick a year to move the whole dashboard.</p>
${yearPicker(year)}
${cardsHtml}
<div class="chart-grid">
${chartBlock('Population, 2020–2024 (millions)', pop, SERIES.population.source, SERIES.population.note)}
${chartBlock('Real GDP growth, 2020–2024 (%)', gdp, SERIES.gdpGrowth.source, SERIES.gdpGrowth.note)}
</div>
<section class="chart-block"><h2>Largest provinces by population, 2024</h2>
<table class="data-table"><thead><tr><th>Province</th><th>Population (millions)</th><th>Capital</th><th>Island group</th></tr></thead><tbody>${provRows}</tbody></table>
${sourceLine('BPS population projections, 2024 (approx. figures). See the full 38-province table on the Regions page.')}
<p><a class="button" href="#/regions">See all 38 provinces →</a></p></section>
<section class="chart-block"><h2>What changed in ${year}?</h2>
<ul class="takeaways">
<li><strong>Growth stayed above 5%:</strong> real GDP grew ${SERIES.gdpGrowth.values[year].toFixed(2)}% in ${year} (BPS National Accounts).</li>
<li><strong>Prices cooled:</strong> December inflation was ${SERIES.inflation.values[year].toFixed(2)}% year-on-year, down from 5.51% in 2022 (BPS CPI).</li>
<li><strong>Jobs improved:</strong> open unemployment fell to ${SERIES.unemployment.values[year].toFixed(2)}% in August ${year} (BPS Sakernas).</li>
<li><strong>Fewer people in poverty:</strong> ${SERIES.poverty.values[year].toFixed(2)}% of the population in September ${year}, the lowest on record (BPS).</li>
</ul></section>`;
}

// ---- Population & demographics ------------------------------------------
export function population(year) {
  const pop = lineChart(seriesPoints('population'), { format: fmt1 });
  const hdi = lineChart(seriesPoints('hdi'), { format: fmt2 });
  const age = donutChart(AGE_GROUPS.map((a) => ({ label: a.group, value: a.share })), { centre: '281.6 jt' });
  const ageRows = AGE_GROUPS.map((a) => `<tr><td>${esc(a.group)}</td><td class="num">${a.share.toFixed(1)}%</td><td>${esc(a.note)}</td></tr>`).join('');
  return `<h1>Population &amp; demographics</h1>
<p class="lede">Who lives in Indonesia, how old they are, and how the population has grown since the 2020 census.</p>
${yearPicker(year)}
${cards([
  { value: SERIES.population.values[year].toFixed(1) + ' million', label: 'Population in ' + year, sub: 'World’s 4th largest population; approx. 56% live on Java.', source: 'BPS, ' + year },
  { value: 'approx. 1.0% a year', label: 'Population growth', sub: 'Slowing steadily from 1.25% a year in 2010–2020.', source: 'BPS, 2024' },
  { value: SERIES.hdi.values[year].toFixed(2), label: 'Human Development Index ' + year, sub: 'High human development; life expectancy approx. 74 years.', source: 'BPS HDI, ' + year },
  { value: 'approx. 68%', label: 'Working-age share (15–64)', sub: 'Indonesia is in its demographic dividend window.', source: 'BPS projections, 2024' },
])}
<div class="chart-grid">
${chartBlock('Population, 2020–2024 (millions)', pop, SERIES.population.source, SERIES.population.note)}
${chartBlock('Human Development Index, 2020–2024', hdi, SERIES.hdi.source, SERIES.hdi.note)}
</div>
<section class="chart-block"><h2>Age structure, 2024</h2>${age}
<table class="data-table"><thead><tr><th>Age group</th><th>Share</th><th>What it means</th></tr></thead><tbody>${ageRows}</tbody></table>
${sourceLine('BPS population projections, 2024 (approx. shares). The 15–64 group is about two-thirds of everyone.')}</section>
<section class="chart-block"><h2>Where people live</h2>
<ul class="takeaways">
<li><strong>Java is home to approx. 56%</strong> of all Indonesians on about 7% of the land — the densest island by far (BPS, 2024).</li>
<li><strong>DKI Jakarta</strong> packs approx. 10.7 million people into 664 km² — about 16,000 people per km² (BPS, 2024).</li>
<li><strong>Papua’s provinces</strong> are the emptiest: Papua Pegunungan has about 29 people per km² (BPS, 2024).</li>
<li><strong>Urban share:</strong> approx. 58% of Indonesians live in urban areas, up from about 49% in 2010 (BPS).</li>
</ul>
<p><a class="button" href="#/regions">Compare all 38 provinces →</a></p></section>`;
}

// ---- Economy -------------------------------------------------------------
export function economy(year, tab) {
  const tabs = [
    { id: 'growth', label: 'Growth & GDP' },
    { id: 'sectors', label: 'Sectors' },
    { id: 'trade', label: 'Trade' },
  ];
  const tabHtml = `<div class="tabs" role="tablist">${tabs.map((t) => `<button role="tab" data-tab="${t.id}" aria-selected="${t.id === tab}" class="${t.id === tab ? 'active' : ''}">${t.label}</button>`).join('')}</div>`;
  let body = '';
  if (tab === 'sectors') {
    body = chartBlock(
      'Share of GDP by sector, 2024 (%)',
      hbarChart(SECTORS.map((s) => ({ label: s.sector, value: s.share })), { format: (v) => v.toFixed(1) + '%' }),
      'BPS National Accounts, 2024 (approx. shares).',
      'Manufacturing is still the single largest sector at about 18.7% of GDP; services together are more than half.',
    ) + `<section class="chart-block"><h2>Reading the mix</h2><ul class="takeaways">
<li><strong>Manufacturing (18.7%)</strong> — food, textiles, electronics and motor vehicles; concentrated in Java.</li>
<li><strong>Agriculture (12.5%)</strong> — palm oil, rice, rubber and coffee; still the biggest employer (see Labour).</li>
<li><strong>Mining (8.6%)</strong> — coal and nickel; nickel smelting has grown fast since the ore-export ban.</li>
<li><strong>Digital economy</strong> — information &amp; communication is 4.4% of GDP and the fastest-growing sector.</li></ul></section>`;
  } else if (tab === 'trade') {
    const tradeRows = TRADE.map((t) => `<tr><td>${esc(t.label)}</td><td><strong>${esc(t.value)}</strong></td><td>${esc(t.note)}</td></tr>`).join('');
    body = `<section class="chart-block"><h2>Trade in 2024</h2>
<table class="data-table"><thead><tr><th>Item</th><th>Figure</th><th>Note</th></tr></thead><tbody>${tradeRows}</tbody></table>
${sourceLine('BPS Trade Statistics, 2024 (approx. figures).')}</section>
<section class="chart-block"><h2>What Indonesia sells and buys</h2><ul class="takeaways">
<li><strong>Top exports:</strong> coal, palm oil, nickel products, electronics, garments and footwear.</li>
<li><strong>Top imports:</strong> machinery and mechanical appliances, electrical equipment, iron and steel, fuel.</li>
<li><strong>Surplus streak:</strong> Indonesia has run a goods-trade surplus every year since 2020.</li>
<li><strong>China is the biggest partner</strong> on both sides — about 22% of exports and 34% of imports.</li></ul></section>`;
  } else {
    body = `<div class="chart-grid">
${chartBlock('Real GDP growth, 2020–2024 (%)', barChart(seriesPoints('gdpGrowth'), { format: fmt2, unit: '%' }), SERIES.gdpGrowth.source, SERIES.gdpGrowth.note)}
${chartBlock('Nominal GDP, 2020–2024 (Rp trillion)', barChart(seriesPoints('gdpNominal'), { format: fmtInt, unit: 'Rp tn' }), SERIES.gdpNominal.source, SERIES.gdpNominal.note)}
</div>
${cards([
  { value: 'Rp ' + SERIES.gdpNominal.values[year].toLocaleString('en-US') + ' tn', label: 'Nominal GDP ' + year, sub: 'Approx. US$1.40 trillion — the largest economy in Southeast Asia.', source: 'BPS National Accounts, ' + year },
  { value: 'Rp ' + SERIES.gdpPerCapita.values[year].toFixed(1) + ' jt', label: 'GDP per capita ' + year, sub: 'Approx. US$4,960; upper-middle-income since 2020.', source: 'BPS National Accounts, ' + year },
  { value: '+' + SERIES.gdpGrowth.values[year].toFixed(2) + '%', label: 'Real growth ' + year, sub: 'Household consumption is about 54% of GDP.', source: 'BPS National Accounts, ' + year },
])}
<section class="chart-block"><h2>How growth is built</h2><ul class="takeaways">
<li><strong>Household consumption</strong> is the engine — about 54% of GDP (BPS National Accounts).</li>
<li><strong>Investment</strong> is about 29% of GDP, led by buildings and machinery.</li>
<li><strong>Government spending</strong> is about 8–9% of GDP; the 2024 budget deficit was about 2.3% of GDP.</li>
<li><strong>Net exports</strong> add a small positive share while the trade surplus lasts.</li></ul></section>`;
  }
  return `<h1>Economy</h1>
<p class="lede">How big Indonesia’s economy is, how fast it grows, what it makes and what it trades — all from BPS National Accounts and Trade Statistics.</p>
${yearPicker(year)}
${tabHtml}
${body}`;
}

// ---- Prices & inflation ---------------------------------------------------
export function prices(year) {
  const inf = lineChart(seriesPoints('inflation'), { format: fmt2 });
  const cpi = hbarChart(CPI_GROUPS.map((c) => ({ label: c.group, value: c.inflation })), { format: (v) => v.toFixed(1) + '%' });
  const cpiRows = CPI_GROUPS.map((c) => `<tr><td>${esc(c.group)}</td><td class="num">${c.inflation.toFixed(1)}%</td></tr>`).join('');
  return `<h1>Prices &amp; inflation</h1>
<p class="lede">What prices did in ${year} — headline inflation, and which groups of goods and services moved most.</p>
${yearPicker(year)}
${cards([
  { value: SERIES.inflation.values[year].toFixed(2) + '%', label: 'Inflation, December ' + year + ' (year-on-year)', sub: 'Bank Indonesia’s target range is 1.5–3.5%.', source: 'BPS CPI, Dec ' + year },
  { value: '5.6%', label: 'Fastest-rising group, Dec 2024', sub: 'Personal care & other services — led by gold jewellery prices.', source: 'BPS CPI, Dec 2024' },
  { value: '-0.3%', label: 'Falling group, Dec 2024', sub: 'Information, communication & financial services got cheaper.', source: 'BPS CPI, Dec 2024' },
  { value: '5.51%', label: 'Peak: December 2022', sub: 'Driven by the September 2022 fuel-price rise.', source: 'BPS CPI, Dec 2022' },
])}
<div class="chart-grid">
${chartBlock('December inflation, 2020–2024 (% year-on-year)', inf, SERIES.inflation.source, SERIES.inflation.note)}
<section class="chart-block"><h2>Inflation by spending group, Dec 2024 (% y-on-y)</h2>${cpi}${sourceLine('BPS Consumer Price Index, December 2024 (approx. figures).')}</section>
</div>
<section class="chart-block"><h2>All groups, December 2024</h2>
<table class="data-table"><thead><tr><th>Spending group</th><th>Inflation (y-on-y)</th></tr></thead><tbody>${cpiRows}</tbody></table>
${sourceLine('BPS CPI, December 2024.')}</section>
<section class="chart-block"><h2>How to read it</h2><ul class="takeaways">
<li><strong>Volatile food</strong> (rice, chillies, chicken) moves the headline most month to month.</li>
<li><strong>Administered prices</strong> (fuel, electricity, LPG) jump when the government adjusts them — as in September 2022.</li>
<li><strong>Core inflation</strong> — excluding volatile food and administered prices — was about 2.3% in December 2024.</li></ul></section>`;
}

// ---- Labour & unemployment -------------------------------------------------
export function labour(year) {
  const unemp = lineChart(seriesPoints('unemployment'), { format: fmt2 });
  const emp = hbarChart(EMPLOYMENT_SECTORS.map((e) => ({ label: e.sector, value: e.share })), { format: (v) => v.toFixed(1) + '%' });
  const factRows = LABOUR_FACTS.map((f) => `<tr><td>${esc(f.label)}</td><td><strong>${esc(f.value)}</strong></td><td>${esc(f.source)}</td></tr>`).join('');
  return `<h1>Labour &amp; unemployment</h1>
<p class="lede">Who works, where they work, and who is still looking — from the August ${year} Labour Force Survey (Sakernas).</p>
${yearPicker(year)}
${cards([
  { value: SERIES.unemployment.values[year].toFixed(2) + '%', label: 'Open unemployment, Aug ' + year, sub: 'Approx. 7.5 million people unemployed in Aug 2024.', source: 'BPS Sakernas, Aug ' + year },
  { value: 'approx. 152.1 m', label: 'Labour force, Aug 2024', sub: 'Participation rate about 70.7% of people aged 15+.', source: 'BPS Sakernas, Aug 2024' },
  { value: 'approx. 59%', label: 'Informal workers', sub: 'Most work without a formal contract or social security.', source: 'BPS Sakernas, Aug 2024' },
  { value: 'approx. 17%', label: 'Youth unemployment (15–24)', sub: 'Young people face the hardest job search.', source: 'BPS Sakernas, Aug 2024' },
])}
<div class="chart-grid">
${chartBlock('Open unemployment rate, 2020–2024 (%)', unemp, SERIES.unemployment.source, SERIES.unemployment.note)}
<section class="chart-block"><h2>Employment by sector, Aug 2024 (% of workers)</h2>${emp}${sourceLine('BPS Sakernas, August 2024 (approx. shares).')}</section>
</div>
<section class="chart-block"><h2>Labour market in numbers</h2>
<table class="data-table"><thead><tr><th>Indicator</th><th>Figure</th><th>Source</th></tr></thead><tbody>${factRows}</tbody></table>
${sourceLine('BPS Sakernas, August 2024; provincial minimum-wage decrees, 2025.')}</section>
<section class="chart-block"><h2>What to watch</h2><ul class="takeaways">
<li><strong>Formalisation is slow:</strong> about 6 in 10 workers are informal, mostly in agriculture and trade.</li>
<li><strong>Agriculture still employs the most people</strong> (28.2%) while producing only 12.5% of GDP.</li>
<li><strong>Youth unemployment</strong> runs about three times the national rate — the labour market’s sharpest edge.</li></ul></section>`;
}

// ---- Regions / provinces ---------------------------------------------------
export function regions(year, island) {
  const islands = ['All', ...new Set(PROVINCES.map((p) => p.island))];
  const filtered = island === 'All' ? PROVINCES : PROVINCES.filter((p) => p.island === island);
  const totalPop = filtered.reduce((s, p) => s + p.pop, 0);
  const columns = [
    { key: 'name', label: 'Province', numeric: false },
    { key: 'capital', label: 'Capital', numeric: false },
    { key: 'island', label: 'Island group', numeric: false },
    { key: 'pop', label: 'Population (millions)', numeric: true, format: (v) => v.toFixed(1) },
    { key: 'area', label: 'Area (thousand km²)', numeric: true, format: (v) => v.toFixed(1) },
    { key: 'density', label: 'Density (people/km²)', numeric: true, format: (v, r) => Math.round((r.pop * 1000000) / (r.area * 1000)).toLocaleString('en-US') },
  ];
  const rows = filtered.map((p) => ({ ...p, density: (p.pop * 1000000) / (p.area * 1000) }));
  const islandOptions = islands.map((g) => `<option value="${g}"${g === island ? ' selected' : ''}>${g === 'All' ? 'All island groups' : g}</option>`).join('');
  const top = [...filtered].sort((a, b) => b.pop - a.pop).slice(0, 8);
  return `<h1>Regions &amp; provinces</h1>
<p class="lede">All 38 provinces: population, capital, area and density. Filter by island group, search by name, or click a column heading to sort.</p>
${yearPicker(year)}
<div class="filter-row"><label class="island-picker">Island group <select id="island-select" aria-label="Filter by island group">${islandOptions}</select></label><span class="filter-summary">${filtered.length} provinces · approx. ${totalPop.toFixed(1)} million people (sum of rounded province figures)</span></div>
<section class="chart-block"><h2>Largest provinces in this selection</h2>${hbarChart(top.map((p) => ({ label: p.name, value: p.pop })), { format: (v) => v.toFixed(1) + ' jt' })}${sourceLine('BPS population projections, 2024 (approx. figures).')}</section>
<section class="chart-block"><h2>All provinces</h2>${sortableTable('provinces-table', columns, rows, { searchPlaceholder: 'Search a province or capital…' })}${sourceLine('BPS population projections and provincial areas, 2024 (approx. figures). Density is computed from those two columns.')}</section>`;
}

// ---- About / sources --------------------------------------------------------
export function about() {
  const factRows = ABOUT_FACTS.map((f) => `<tr><td>${esc(f.label)}</td><td><strong>${esc(f.value)}</strong></td></tr>`).join('');
  return `<h1>About this site</h1>
<p class="lede">NusaStat is an independent, original statistics portal about Indonesia. It is not affiliated with Badan Pusat Statistik (BPS) or any government body; BPS is cited throughout as the source of the figures.</p>
<section class="chart-block"><h2>Indonesia in brief</h2>
<table class="data-table"><thead><tr><th>Fact</th><th>Detail</th></tr></thead><tbody>${factRows}</tbody></table>
${sourceLine('BPS and public records, 2024–2025.')}</section>
<section class="chart-block"><h2>Where the numbers come from</h2><ul class="takeaways">
<li><strong>Population:</strong> BPS Population Census 2020 and official projections (2024).</li>
<li><strong>Economy:</strong> BPS National Accounts — GDP, growth and sector shares (2024).</li>
<li><strong>Prices:</strong> BPS Consumer Price Index, December year-on-year (2020–2024).</li>
<li><strong>Labour:</strong> BPS Sakernas Labour Force Survey, August round (2020–2024).</li>
<li><strong>Poverty:</strong> BPS Poverty Statistics, September round (2020–2024).</li>
<li><strong>Trade:</strong> BPS Trade Statistics (2024).</li>
<li><strong>Human development:</strong> BPS Human Development Index (2020–2024).</li></ul>
<p class="note">Figures are the published rounded values; where a figure is approximate it is labelled “approx.”. US$ conversions use approx. Rp 15,800 per US$ (2024). This site works fully offline: every figure, chart and page is in its own files and no network request is made.</p></section>
<section class="chart-block"><h2>How to use this site</h2><ul class="takeaways">
<li><strong>Overview</strong> — the headline dashboard; pick a year to move it.</li>
<li><strong>Population</strong> — age structure and where people live.</li>
<li><strong>Economy</strong> — growth, sectors and trade, on three tabs.</li>
<li><strong>Prices</strong> — inflation by year and by spending group.</li>
<li><strong>Labour</strong> — unemployment and employment by sector.</li>
<li><strong>Regions</strong> — all 38 provinces, sortable and searchable.</li></ul>
<p><a class="button" href="#/">Back to the overview →</a></p></section>`;
}

export function notFound() {
  return `<h1>Page not found</h1><p class="lede">There is no statistics page at this address.</p><p><a class="button" href="#/">Back to the overview →</a></p>`;
}
