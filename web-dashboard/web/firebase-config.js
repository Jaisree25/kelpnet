export const firebaseConfig = {
  apiKey: "AIzaSyCJfHlxr75BlAmAoYq5a0igrYNhBbm09U4",
  authDomain: "kelp-6bce0.firebaseapp.com",
  projectId: "kelp-6bce0",
  storageBucket: "kelp-6bce0.firebasestorage.app",
  messagingSenderId: "382477795367",
  appId: "1:382477795367:web:7dfb274ec6cb7aa1fcce02",
  measurementId: "G-VS5JGM4LEL"
};

const GOOGLE_MAPS_KEY = "AIzaSyAL5VM2PiJxEZINzwTCdkoHlzfvDlXi3ws";

const script = document.createElement("script");
script.src =
  `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=marker&v=weekly&callback=initMap`;
script.async = true;
script.defer = true;

document.head.appendChild(script);