import { db } from "./firebase.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export function initPrioprityList() {
    const ref = collection(db, "sites");

    onSnapshot(ref, (snapshot) => {
        let sites = [];

        snapshot.forEach(doc => {
            sites.push({ id: doc.id, ...doc.data() });
        });

        sites.sort((a, b) => b.riskScore - a.riskScore);

        let html = "<h2>Crew Priority</h2>";

        sites.forEach(s => {
            html += 
                <div>
                    <b>${s.name}</b><br/>
                    Risk: ${s.riskScore}<br/>
                    Status: ${s.status}
                </div>
            ;
        });
        document.getElementById("panel").innerHTML = html;
    });
}