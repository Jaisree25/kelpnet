let sites = [];
let selectedSiteId = null;
let googleMap = null;
let mapMarkers = {};
let activeFilter = "all";


document.addEventListener("DOMContentLoaded", () => {
    console.log("APP LOADED");

    initFirebase();

    subscribeToSites((firebaseSites) => {
        console.log("Firebase update:", firebaseSites.length);

        sites = firebaseSites;
        renderAll();
    });
});

window.initMap = function initMap() {
    console.log("Google Maps loaded");

    googleMap = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 36.6, lng: -121.9 },
        zoom: 9,
        mapTypeId: "satellite",
        mapId: "YOUR_MAP_ID" // required for AdvancedMarkerElement
    });

    document.getElementById("map-placeholder").style.display = "none";
    document.getElementById("map").style.display = "block";

    renderMapMarkers();
};

const STATUS_COLORS = {
    critical: "#FF3B30",
    warning: "#FF9500",
    clear: "#34C759",
    survey: "#8E8E93"
};

function createMarkerSVG(color) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="${color}" stroke="#fff" stroke-width="2"/>
</svg>`;
    const div = document.createElement("div");
    div.innerHTML = svg;
    return div;
}

function renderMapMarkers() {
    if (!googleMap) return;

    Object.values(mapMarkers).forEach(m => m.map = null);
    mapMarkers = {};

    sites.forEach(site => {
        if (site.lat == null || site.lng == null) return;

        const color = STATUS_COLORS[site.status] || STATUS_COLORS.survey;


        const marker = new google.maps.marker.AdvancedMarkerElement({
            position: { lat: site.lat, lng: site.lng },
            map: googleMap,
            title: site.name,
            content: createMarkerSVG(color)
        });

        marker.addListener("click", () => selectSite(site.id));

        mapMarkers[site.id] = marker;
    });
}


function renderAll() {
    updateStats();
    renderPriorityList();
    renderMapMarkers();

    const el = document.getElementById("site-count");
    if (el) el.textContent = `${sites.length} sites`;

    if (selectedSiteId) {
        const site = sites.find(s => s.id === selectedSiteId);
        renderSiteDetail(site);
    }
}

function updateStats() {
    ["critical", "warning", "clear", "survey"].forEach(status => {
        const el = document.getElementById(`stat-${status}`);
        if (el) {
            el.textContent = sites.filter(s => s.status === status).length;
        }
    });
}

function setFilter(status) {
    activeFilter = status;

    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.status === status);
    });

    renderPriorityList();
}


function renderPriorityList() {
    const container = document.getElementById("priority-list");
    if (!container) return;

    const filtered = activeFilter === "all" ? sites : sites.filter(s => s.status === activeFilter);

    container.innerHTML = filtered.map(s => `
        <div class="priority-card" onclick="selectSiteFromList('${s.id}')">
            <div class="priority-site">
                ${s.name || "Unnamed Site"}
            </div>
            <button 
                class="action-btn ${s.action_done ? "action-done" : ""}"
                onclick="toggleActionDone('${s.id}', event)">
                ${s.action_done ? "Undo Done" : "Mark  Done"}
            </button>
        </div>
    `).join("");
}

function toggleActionDone(siteId, event) {
    event.stopPropagation();

    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    db.collection("sites").doc(siteId).update({
        action_done: !site.action_done,
        last_updated: new Date()
    });

    toast(site.action_done ? "Action unmarked" : "Action marked as done");
}

function selectSite(id) {
    selectedSiteId = id;
    const site = sites.find(s => s.id === id);
    if (!site) return;

    // Pan map to selected site
    if (googleMap && site.lat != null && site.lng != null) {
        googleMap.panTo({ lat: site.lat, lng: site.lng });
    }

    renderSiteDetail(site);
}

function selectSiteFromList(id) {
    selectSite(id);

    // Show detail modal when coming from priority list
    const site = sites.find(s => s.id === id);
    if (!site) return;

    document.getElementById("detail-name").textContent = site.name || "Unnamed Site";
    document.getElementById("detail-status").textContent = site.status || "—";
    document.getElementById("detail-lat").textContent = site.lat?.toFixed(5) ?? "—";
    document.getElementById("detail-lng").textContent = site.lng?.toFixed(5) ?? "—";
    document.getElementById("detail-depth").textContent = site.depth_m ?? "—";
    document.getElementById("detail-notes").textContent = site.notes || "—";

    document.getElementById("detail-modal").style.display = "flex";
}

function closeDetailModal() {
    document.getElementById("detail-modal").style.display = "none";
}

function renderSiteDetail(site) {
    const container = document.getElementById("site-detail");

    console.log(container);
    if (!container || !site) return;

    container.innerHTML = `
        <div class="detail-site-name">${site.name || "Unnamed Site"}</div>

        <div class="detail-coords">
            ${site.lat?.toFixed?.(5) ?? "—"}, ${site.lng?.toFixed?.(5) ?? "—"}
        </div>

        <div class="status-badge status-${site.status}">
            <span class="status-dot"></span>
            ${site.status}
        </div>

        <div class="detail-section">
            <div class="detail-section-title">SITE DATA</div>

            <div class="detail-row">
                <div class="key">Depth</div>
                <div class="val">${site.depth_m ?? "—"} m</div>
            </div>

            <div class="detail-row">
                <div class="key">Last Updated</div>
                <div class="val">
                    ${site.last_updated
                        ? new Date(site.last_updated).toLocaleString()
                        : "—"}
                </div>
            </div>

            <div class="detail-row">
                <div class="key">Action Done</div>
                <div class="val">${site.action_done ? "Yes" : "No"}</div>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">REPORTS</div>

            ${
                site.reports?.length
                    ? site.reports.map(r => `
                        <div class="diver-report-card">
                            <div class="report-meta">
                                <div class="diver-name">${r.diver || "Unknown"}</div>
                                <div class="report-time">${r.time || ""}</div>
                            </div>
                            <div class="report-notes">${r.notes || ""}</div>
                        </div>
                    `).join("")
                    : `<div class="panel-subtitle">No reports yet</div>`
            }
        </div>
    `;
}


function switchView(view) {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(`view-${view}`)?.classList.add("active");
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

    db.collection("sites").add(site);

    closeModal();
    toast("Site added");
}


function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;

    document.getElementById("toasts")?.appendChild(el);

    setTimeout(() => {
        el.classList.add("fade-out");
        setTimeout(() => el.remove(), 300);
    }, 3000);
}


window.switchView = switchView;
window.selectSite = selectSite;
window.openAddSiteModal = openAddSiteModal;
window.closeModal = closeModal;
window.submitSite = submitSite;
window.setFilter = setFilter;