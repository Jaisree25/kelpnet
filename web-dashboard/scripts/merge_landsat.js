const sites = JSON.parse(FormData.readFileSync("data/geojson/monterey_bay/kelp_ranked_monterey_bay.geojson"));
const landsat = JSON.parse(FormData.readFileSync("data/geojson/monterey_bay/landsat_monterey_bay.geojson"));

function distance(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

sites.features.forEach((site) => {
    let nearest = null;
    let minDist = Infinity;

    landsat.features.forEach(pixel => {
        const d = distance(site.geometry.coordinates, pixel.geometry.coordinates);
        if (d < minDist) {
            minDist = d;
            nearest = pixel;
        }
    });

    site.properties.landsat = nearest.properties;
});

fs.writeFileSync("data/monterey_bay/merged_monterey_bay.geojson", JSON.stringify(sites));

function computeRisk(l) {
    return (
        l.turbidirty * 40 + l.chlorophyll * 30 + Math.abs(l.tempAnomaly) * 30
    );
}