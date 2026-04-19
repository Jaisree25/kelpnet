# kelpnet

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Learn Flutter](https://docs.flutter.dev/get-started/learn-flutter)
- [Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Flutter learning resources](https://docs.flutter.dev/reference/learning-resources)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

____________
# KelpNet - Flutter Mobile App

A community-powered kelp forest restoration platform that connects satellite data, divers, and restoration crews to bring back Monterey Bay's disappearing kelp ecosystems.

## What This App Does

KelpNet is a Flutter mobile app for divers in the field. Divers open the app, see a live map of Monterey Bay with color-coded kelp restoration sites, tap a site pin, and submit a field report with urchin density, kelp presence, GPS coordinates, and photos. Reports save instantly to Firebase Firestore and update the shared web dashboard in real time.

## Color-Coded Site Status

- Red = Critical (urgent action needed)
- Orange = Warning (monitoring required)
- Green = Clear (healthy)
- Blue = Survey (needs assessment)

## Tech Stack

- Flutter (iOS and Android)
- Firebase Firestore (real-time database)
- Google Maps Flutter (map and pin display)
- Geolocator (GPS auto-tagging)
- Image Picker (photo documentation)
- Firebase Cloud Messaging (push notifications - coming soon)

## Setup Instructions

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

## Important Security Notes

- Never commit `lib/firebase_config.dart` - it is in `.gitignore`
- Never commit `ios/Runner/GoogleService-Info.plist` - it is in `.gitignore`
- Restrict your Google Maps API key to your bundle ID in Google Cloud Console

## Features Built

- Live Google Maps with color-coded kelp site pins
- Real-time Firestore data sync
- Diver report form with urchin density and kelp presence
- GPS auto-tagging on report submission
- Photo selection and preview
- Reports saved to Firestore subcollection per site

## Features In Progress

- Photo upload to Firebase Storage
- Push notifications 

## Team

KelpNet - GDG on Campus Solution Challenge 2026

