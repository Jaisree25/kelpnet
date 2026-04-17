let sites = [];
let selectedSiteId = null;
let activeFilter = "all";
let googleMap = null;
let mapMarkers = {};

async function loadSitesFromGeoJSON() {
    const res = await fetch("./data/geojson/monterey_bay/kelp_ranked_monterey_bay.geojson");
    const geo = await res.json();

    sites = geo.features.map((f, i) => ({
        id: f.properties?.id || `geo-${i}`,
        name: f.properties?.name || "Unnamed Site",
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        status: f.properties?.status || "survey",
        depth_m: f.properties?.depth_m ?? 0,
        last_updated: f.properties?.last_updated
            ? new Date(f.properties.last_updated)
            : new Date(),
        action_done: f.properties?.action_done || false,
        reports: f.properties?.reports || []
    }));

    renderAll();
}

document.addEventListener("DOMContentLoaded", async () => {
    initFirebase();
    await loadSitesFromGeoJSON();
});

function renderAll() {
    updateStats();
    renderPriorityList();
    renderMapMarkers();
    document.getElementById("site-count").textContent = `${sites.length} sites`;
}

function switchView(view) {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(`view-${view}`).classList.add("active");
}

function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;

    document.getElementById("toasts").appendChild(el);

    setTimeout(() => {
        el.classList.add("fade-out");
        setTimeout(() => el.remove(), 300);
    }, 3000);
}

function updateStats() {
    ["critical", "warning", "clear", "survey"].forEach(s => {
        const el = document.getElementById(`stat-${s}`);
        if (el) el.textContent = sites.filter(x => x.status === s).length;
    });
}

function renderPriorityList() {
    const container = document.getElementById("priority-list");

    container.innerHTML = sites.map(s => `
        <div class="priority-card" onclick="selectSite('${s.id}')">
            <div class="priority-site">${s.name}</div>
        </div>
    `).join("");
}

function selectSite(id) {
    selectedSiteId = id;
    const site = sites.find(s => s.id === id);
    document.getElementById("panel-subtitle").textContent = site?.name || "";
}

function openAddSiteModal() {
    document.getElementById("add-modal").classList.add("open");
}

function closeModal() {
    document.getElementById("add-modal").classList.remove("open");
}

function submitSite() {
    const site = {
        id: "demo-" + Date.now(),
        name: document.getElementById("f-name").value,
        lat: parseFloat(document.getElementById("f-lat").value),
        lng: parseFloat(document.getElementById("f-lng").value),
        status: document.getElementById("f-status").value,
        depth_m: parseFloat(document.getElementById("f-depth").value),
        last_updated: new Date(),
        action_done: false,
        reports: []
    };
    sites.push(site);
    renderAll();
    closeModal();
    toast("Site added");
}