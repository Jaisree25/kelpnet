import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { firebaseConfig } from "../web/firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Read GeoJSON
const geo = JSON.parse(
  fs.readFileSync(
    "data/geojson/monterey_bay/kelp_ranked_monterey_bay.geojson",
    "utf-8"
  )
);

// 🔥 Helper: safely unwrap nested GeoJSON coordinates
function getFirstCoordinate(coords) {
  // Keep drilling down until we hit [lng, lat]
  while (Array.isArray(coords) && Array.isArray(coords[0])) {
    coords = coords[0];
  }
  return coords; // now should be [lng, lat]
}

for (const f of geo.features) {
  // ---- ID handling ----
  const id = f.id || f.properties?.id || f.properties?.site_id;

  if (!id) {
    console.warn("Skipping feature (missing id):", f.properties);
    continue;
  }

  // ---- Safe coordinate extraction ----
  const coords = getFirstCoordinate(f.geometry?.coordinates || []);

  if (!coords || coords.length < 2) {
    console.warn("Skipping feature (bad coords):", id);
    continue;
  }

  const [lng, lat] = coords;

  // ---- Build clean Firestore object (no undefined values!) ----
  const data = {
    name: f.properties?.name ?? null,
    status: f.properties?.status ?? null,
    riskScore: f.properties?.risk_score ?? null,
    location: {
      lat,
      lng,
    },
  };

  try {
    await setDoc(doc(db, "sites", String(id)), data);
    console.log("written:", id);
  } catch (err) {
    console.error("write failed:", id, err);
  }
}

console.log("Import complete.");
