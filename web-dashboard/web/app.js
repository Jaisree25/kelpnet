let sites = [];
let selectedSiteId = null;
let googleMap = null;
let mapMarkers = {};


document.addEventListener("DOMContentLoaded", () => {
    console.log("🔥 APP LOADED");

    initFirebase();

    subscribeToSites((firebaseSites) => {
        console.log("🔥 Firebase update:", firebaseSites.length);

        sites = firebaseSites;
        renderAll();
    });
});

window.initMap = function initMap() {
    console.log("🗺️ Google Maps loaded");

    googleMap = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 36.6, lng: -121.9 }, // Monterey Bay
        zoom: 9,
        mapTypeId: "satellite"
    });

    // switch UI from placeholder → real map
    document.getElementById("map-placeholder").style.display = "none";
    document.getElementById("map").style.display = "block";

    renderMapMarkers();
};


function renderAll() {
    updateStats();
    renderPriorityList();
    renderMapMarkers();

    const el = document.getElementById("site-count");
    if (el) el.textContent = `${sites.length} sites`;

    // 🔥 IMPORTANT: re-render selected site after updates
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

function renderPriorityList() {
    const container = document.getElementById("priority-list");
    if (!container) return;

    container.innerHTML = sites.map(s => `
        <div class="priority-card" onclick="selectSite('${s.id}')">
            <div class="priority-site">
                ${s.name || "Unnamed Site"}
            </div>
        </div>
    `).join("");
}

/* =========================
   MAP MARKERS
========================= */

function renderMapMarkers() {
    if (!googleMap) return;

    Object.values(mapMarkers).forEach(m => m.setMap(null));
    mapMarkers = {};

    sites.forEach(site => {
        if (site.lat == null || site.lng == null) return;

        const marker = new google.maps.Marker({
            position: { lat: site.lat, lng: site.lng },
            map: googleMap,
            title: site.name
        });

        marker.addListener("click", () => selectSite(site.id));

        mapMarkers[site.id] = marker;
    });
}

/* =========================
   SITE SELECTION
========================= */

function selectSite(id) {
    selectedSiteId = id;

    const site = sites.find(s => s.id === id);

    console.log("Selected site:", site);

    const title = document.getElementById("panel-subtitle");
    if (title) title.textContent = site?.name || "";

    renderSiteDetail(site);
}

/* =========================
   SITE DETAIL PANEL
========================= */

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