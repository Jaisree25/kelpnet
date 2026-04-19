const GOOGLE_MAPS_KEY = "AIzaSyCac6aTe_e02E9cmho4oq_mmhdLW8XzMaU";

const script = document.createElement("script");
script.src =
  `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=marker&v=weekly&callback=initMap`;
script.async = true;
script.defer = true;

document.head.appendChild(script);