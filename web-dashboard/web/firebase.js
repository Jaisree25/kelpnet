let db = null;
let useFirebase = false;

let unsubscribeSites = null;


function initFirebase() {
    try {
        if (!firebaseConfig) {
            console.warn("Missing firebaseConfig");
            return;
        }

        // prevent double init
        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }

        db = firebase.firestore();
        window.db = db;

        useFirebase = true;

        console.log("🔥 Firebase connected");

        subscribeToSites();

    } catch (e) {
        console.error("Firebase init failed:", e);
    }
}


function subscribeToSites(callback) {
    if (!db) {
        console.warn("Firestore not ready");
        return;
    }

    db.collection("sites").onSnapshot((snapshot) => {

        const sites = snapshot.docs.map(doc => {
            const data = doc.data();

            return {
                id: doc.id,
                name: data.name || "Unnamed Site",
                lat: data.location?.lat ?? null,
                lng: data.location?.lng ?? null,
                status: normalizeStatus(data.status),
                depth_m: data.depth_m ?? 0,
                last_updated: data.last_updated?.toDate?.() || new Date(),
                action_done: data.action_done || false,
                reports: data.reports || []
            };
        });

        console.log("🔥 Firebase update:", sites.length);

        // ✅ THIS is what was breaking
        if (typeof callback === "function") {
            callback(sites);
        }
    });
}


function normalizeStatus(status) {
    if (status == null) return "survey";

    if (typeof status === "string") {
        const s = status.toLowerCase();

        if (["critical", "warning", "clear", "survey"].includes(s)) {
            return s;
        }

        if (s === "1") return "critical";
        if (s === "2") return "warning";
        if (s === "3") return "clear";
        if (s === "0") return "survey";

        return "survey";
    }

    if (typeof status === "number") {
        if (status === 1) return "critical";
        if (status === 2) return "warning";
        if (status === 3) return "clear";
        return "survey";
    }

    return "survey";
}

/* =========================
   GLOBAL EXPORTS
========================= */

window.initFirebase = initFirebase;
window.subscribeToSites = subscribeToSites;
window.normalizeStatus = normalizeStatus;
