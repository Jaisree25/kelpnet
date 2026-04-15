import { db } from "./firebase.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let map;
let markers = {};

export function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
       center: { lat: 36.96, lng: -122.02},
       zoom: 9
    });
}

export function initFirestoreListener() {
  const sitesRef = collection(db, "sites");

  onSnapshot(sitesRef, (snapshot) => {
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const id = docSnap.id;

      const color =
        d.status === "critical" ? "red" :
        d.status === "warning" ? "orange" :
        "green";

      if (markers[id]) markers[id].setMap(null);

      markers[id] = new google.maps.Marker({
        position: d.location,
        map,
        icon: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`
      });

      markers[id].addListener("click", () => {
        document.getElementById("panel").innerHTML = `
          <h2>${d.name}</h2>
          <p>Status: ${d.status}</p>
          <p>Risk: ${d.riskScore}</p>

          <h3>Landsat</h3>
          <p>Turbidity: ${d.landsat.turbidity}</p>
          <p>Chlorophyll: ${d.landsat.chlorophyll}</p>
          <p>Temp: ${d.landsat.tempAnomaly}</p>
        `;
      });
    });
  });
}

export function listenSites() {
  onSnapshot(collection(db, "sites"), (snapshot) => {
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      const id = docSnap.id;

      const color =
        d.status === "critical" ? "red" :
        d.status === "warning" ? "orange" :
        "green";

      const position = {
        lat: d.location.lat,
        lng: d.location.lng
      };

      if (markers[id]) markers[id].setMap(null);

      markers[id] = new google.maps.Marker({
        position,
        map,
        icon: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`
      });

      markers[id].addListener("click", () => {
        document.getElementById("panel").innerHTML = `
          <h2>${d.name}</h2>
          <p>Status: ${d.status}</p>
          <p>Risk: ${d.riskScore}</p>
        `;
      });
    });
  });
}