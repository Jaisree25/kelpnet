# KelpNet

A community-powered kelp forest restoration platform that connects satellite data, field divers, and restoration crews to bring back Monterey Bay's disappearing kelp ecosystems. Built for the GDG on Campus Solution Challenge 2026 by second year CS students at UCSC.

## The Problem

Monterey Bay is losing its kelp forests to urchin barrens. Restoration crews exist but have no way to coordinate in real time. Divers see problems underwater but have no easy way to alert crews. Satellites detect kelp loss but cannot confirm what is happening on the seafloor.

## The Solution

KelpNet closes the loop between satellite detection and on the ground action through a shared live map that connects everyone involved in restoration.

## How It Works

Satellite detects kelp loss → Diver confirms on app → Map updates → Crew gets priority alert

## Components

### Flutter Mobile App
Built for divers in the field. Divers open the app, see a live map of Monterey Bay with color-coded kelp restoration sites, tap a site pin, and submit a field report with urchin density, kelp presence, GPS coordinates, and photos. Reports save instantly to Firebase Firestore and update the shared web dashboard in real time.

### Web Dashboard
Built for coordinators and crew leaders on land. Shows a live Google Maps view of all kelp sites with color-coded pins, a ranked priority list of sites needing action, and real-time diver reports per site.

### Earth Engine Pipeline
Google Earth Engine processes Landsat satellite imagery of Monterey Bay on a scheduled basis, detects kelp canopy coverage changes, runs a scoring script to rank sites by priority, and exports GeoJSON files with site coordinates and status.

### Backend
Scripts to push GeoJSON data from Earth Engine exports into Firebase Firestore so the Flutter app and web dashboard can read it in real time.

## Site Status Colors

- Red = Critical (urgent action needed)
- Orange = Warning (monitoring required)
- Green = Clear (healthy)
- Blue = Survey (needs assessment)

## Tech Stack

- Flutter (iOS and Android mobile app)
- Firebase Firestore (real-time database)
- Google Maps (Flutter app and web dashboard)
- Google Earth Engine (satellite kelp detection)
- Geolocator (GPS auto-tagging on reports)
- Image Picker (photo documentation)
- JavaScript and HTML (web dashboard)

## Flutter App Setup

1. Clone the repo
2. Run `flutter pub get`
3. Create `lib/firebase_config.dart` with your Firebase credentials:

```dart
import 'package:firebase_core/firebase_core.dart';

const firebaseOptions = FirebaseOptions(
  apiKey: 'your-api-key',
  appId: 'your-app-id',
  messagingSenderId: 'your-sender-id',
  projectId: 'your-project-id',
);
```

4. Add your Google Maps API key to `ios/Runner/AppDelegate.swift`
5. Run `flutter run`

## Web Dashboard Setup

1. Create `web-dashboard/web/firebase-config.js` with your Firebase credentials
2. Add your Google Maps API key to `firebase-config.js`
3. Run `python3 -m http.server 8000` from the root folder
4. Open `http://localhost:8000` in Chrome

## Features Built

- Live Google Maps with color-coded kelp site pins
- Real-time Firestore data sync
- Diver report form with urchin density and kelp presence
- GPS auto-tagging on report submission
- Photo selection and preview
- Reports saved to Firestore subcollection per site
- Web dashboard with live map and priority list
- Earth Engine satellite kelp detection pipeline

## Features In Progress

- Photo upload to Firebase Storage (requires Blaze plan)
- Push notifications (requires Apple Developer account)
- Vertex AI integration for predictive risk modeling

## Team

KelpNet - GDG on Campus Solution Challenge 2026

