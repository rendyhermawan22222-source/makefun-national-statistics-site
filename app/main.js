// main.js — one job: route between the pages and wire the controls. Hash
// routes, so every page has a linkable address and the back button works:
//   #/            Overview dashboard
//   #/population  Population & demographics
//   #/economy     Economy (tabs: growth / sectors / trade)
//   #/prices      Prices & inflation
//   #/labour      Labour & unemployment
//   #/regions     Regions & provinces (island filter, sortable table)
//   #/about       About & sources
//
// State: the selected year (2020-2024), the island filter and the economy
// tab. The year picker and island filter re-render the current page; the
// economy tabs switch without leaving the page. window.__shotReady is false
// while a page renders and true once it is on screen, so a screenshot script
// knows when to capture. A `?shot=` query can also force a route, e.g.
// ?shot=economy loads #/economy — used by shots.json for screenshots.

import { about, economy, labour, notFound, overview, population, prices, regions } from './views.js';
import { wireTable } from './tables.js';

const app = document.getElementById('app');
const nav = document.getElementById('main-nav');

const ROUTES = [
  { path: '', label: 'Overview', render: (s) => overview(s.year) },
  { path: 'population', label: 'Population', render: (s) => population(s.year) },
  { path: 'economy', label: 'Economy', render: (s) => economy(s.year, s.econTab) },
  { path: 'prices', label: 'Prices', render: (s) => prices(s.year) },
  { path: 'labour', label: 'Labour', render: (s) => labour(s.year) },
  { path: 'regions', label: 'Regions', render: (s) => regions(s.year, s.island) },
  { path: 'about', label: 'About', render: () => about() },
];

const state = { year: 2024, island: 'All', econTab: 'growth' };

function currentRoute() {
  const hash = location.hash.replace(/^#\/?/, '').split('?')[0];
  return ROUTES.find((r) => r.path === hash) || null;
}

function render() {
  window.__shotReady = false;
  const route = currentRoute();
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) {
    const forced = ROUTES.find((r) => r.path === shot);
    if (forced) {
      document.title = forced.label + ' | NusaStat — Statistik Indonesia';
      app.innerHTML = forced.render(state);
      wireAfterRender(forced.path);
      window.scrollTo(0, 0);
      window.__shotReady = true;
      return;
    }
  }
  if (!route) {
    document.title = 'Page not found | NusaStat — Statistik Indonesia';
    app.innerHTML = notFound();
  } else {
    document.title = (route.path === '' ? 'Overview' : route.label) + ' | NusaStat — Statistik Indonesia';
    app.innerHTML = route.render(state);
  }
  nav.querySelectorAll('a').forEach((a) => {
    const p = a.getAttribute('href').replace(/^#\/?/, '');
    a.setAttribute('aria-current', route && p === route.path ? 'page' : 'false');
  });
  wireAfterRender(route ? route.path : '');
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function wireAfterRender(path) {
  const yearSelect = document.getElementById('year-select');
  yearSelect?.addEventListener('change', (e) => {
    state.year = Number(e.target.value);
    render();
  });
  const islandSelect = document.getElementById('island-select');
  islandSelect?.addEventListener('change', (e) => {
    state.island = e.target.value;
    render();
  });
  document.querySelectorAll('.tabs [data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.econTab = btn.dataset.tab;
      render();
    });
  });
  if (path === 'regions') wireTable('provinces-table');
}

window.addEventListener('hashchange', render);
render();
