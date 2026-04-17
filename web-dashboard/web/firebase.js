let db = null;
let useFirebase = false;

const apiKey = import.meta.env.FIREBASE_API_KEY;
function initFirebase() {
    if (firebaseConfig.apiKey === apiKey) {
        document.getElementById("config-banner").classList.add("show");
        return;
    }

    try {
        firebase.intializeApp(firebaseConfig);
        db = firebase.getFirestore();
        useFirebase = true;
        console.log("Firebase initialized successfully.");
        subscribeToSites();
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }
}

function subscribeToSites() {
    db.collection("sites").onSnapshot((snapshot) => {
        sites = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        }));
        renderAll();
    });
}
