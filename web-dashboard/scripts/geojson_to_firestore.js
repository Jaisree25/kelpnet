import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { firebaseConfig } from "../web/firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const geo = JSON.parse(
  fs.readFileSync(
    "data/geojson/monterey_bay/kelp_ranked_monterey_bay.geojson",
    "utf-8"
  )
);

function getFirstCoordinate(coords) {
  while (Array.isArray(coords) && Array.isArray(coords[0])) {
    coords = coords[0];
  }
  return coords;
}

function normalizeStatus(status) {
  if (status == null) return "survey";

  // if already valid string
  if (typeof status === "string") {
    const s = status.toLowerCase();

    if (["critical", "warning", "clear", "survey"].includes(s)) {
      return s;
    }

    // numeric strings
    if (s === "1") return "critical";
    if (s === "2") return "warning";
    if (s === "3") return "clear";
    if (s === "0") return "survey";

    return "survey";
  }

  // if number
  if (typeof status === "number") {
    if (status === 1) return "critical";
    if (status === 2) return "warning";
    if (status === 3) return "clear";
    return "survey";
  }

  return "survey";
}

/* 🔥 FIX: robust name extraction */
function getSiteName(props = {}, index = 0) {
  const directName =
    props?.name ||
    props?.Name ||
    props?.title ||
    props?.site_name ||
    props?.SITE_NAME;

  if (directName && directName.trim()) {
    return directName.trim();
  }

  return `Site ${index + 1}`;
}

/* 🔥 FIX: safe ID generation */
function getSiteId(f, index) {
  return (
    f.id ||
    f.properties?.id ||
    f.properties?.site_id ||
    `geo-${index}`
  );
}

for (const [i, f] of geo.features.entries()) {
  const id = getSiteId(f, i);

  if (!id) {
    console.warn("Skipping feature (missing id)");
    continue;
  }

  const coords = getFirstCoordinate(f.geometry?.coordinates || []);

  if (!coords || coords.length < 2) {
    console.warn("Skipping feature (bad coords):", id);
    continue;
  }

  const [lng, lat] = coords;

  const props = f.properties || {};

  const data = {
    name: getSiteName(props, i),

    status: normalizeStatus(props.status),

    depth_m: props.depth_m ?? 0,
    location: { lat, lng },
    last_updated: new Date(),
    action_done: false,
    reports: []
  };

  try {
    await setDoc(doc(db, "sites", String(id)), data, { merge: true });
    console.log("written:", id, data.name, data.status);
  } catch (err) {
    console.error("write failed:", id, err);
  }
}

console.log("Import complete.");
