import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'dart:io';
import 'firebase_config.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: firebaseOptions);
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'KelpNet',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Set<Marker> markers = {};

  @override
  void initState() {
    super.initState();
    loadSites();
  }

Future<void> loadSites() async {
    final snapshot =
        await FirebaseFirestore.instance.collection('sites').get();

    Set<Marker> newMarkers = {};

    for (var doc in snapshot.docs) {
      final data = doc.data();
      final location = data['location'];
      if (location == null) continue;
      final lat = location['lat'];
      final lng = location['lng'];
      if (lat == null || lng == null) continue;
      final status = (data['status'] ?? 'survey').toString();

      BitmapDescriptor icon;
      if (status == 'critical') {
      icon = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed);
    } else if (status == 'warning') {
      icon = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange);
    } else if (status == 'clear') {
      icon = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
    } else {
      icon = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
    }
      newMarkers.add(Marker(
        markerId: MarkerId(doc.id),
        position: LatLng(lat, lng),
        icon: icon,
        infoWindow: InfoWindow(
          title: 'Site ${doc.id}',
          snippet: status == 'critical'
              ? 'Critical'
              : status == 'warning'
                  ? 'Warning'
                  : status == 'clear'
                      ? 'Clear'
                      : 'Survey',
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ReportFormScreen(siteId: doc.id),
              ),
            );
          },
        ),
      ));
    }

    setState(() {
      markers = newMarkers;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.teal,
        title: const Text(
          'KelpNet',
          style: TextStyle(color: Colors.white),
        ),
      ),
      body: GoogleMap(
        initialCameraPosition: const CameraPosition(
          target: LatLng(36.8007, -121.9473),
          zoom: 12.0,
        ),
        markers: markers,
      ),
    );
  }
}

class ReportFormScreen extends StatefulWidget {
  final String siteId;
  const ReportFormScreen({super.key, required this.siteId});
 

  @override
  State<ReportFormScreen> createState() => _ReportFormScreenState();
}

class _ReportFormScreenState extends State<ReportFormScreen> {
  String urchinDensity = 'low';
  bool kelpPresent = false;
  bool isSubmitting = false;
  File? selectedPhoto;
  final ImagePicker picker = ImagePicker();

  Future<Position> getLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    return await Geolocator.getCurrentPosition();
  }

  Future<void> pickPhoto() async {
  final XFile? photo = await picker.pickImage(source: ImageSource.gallery);//need to change to camera for production
  if (photo != null) {
    setState(() {
      selectedPhoto = File(photo.path);
    });
  }
}
/*
Future<String?> uploadPhoto(String siteId) async {
  if (selectedPhoto == null) return null;
  
 
  // Photo upload requires Firebase Storage Blaze plan
  // Returning placeholder for now
  return 'photo_pending';
  /*
}
  final ref = FirebaseStorage.instance
      .ref()
      .child('sites/$siteId/${DateTime.now().millisecondsSinceEpoch}.jpg');
  
  await ref.putFile(selectedPhoto!);
  return await ref.getDownloadURL();
  
  */
}
*/

  Future<void> submitReport() async {
  setState(() => isSubmitting = true);

  Position position = await getLocation();
  /*String? photoUrl = await uploadPhoto(widget.siteId);*/ //uncomment it when ready to implement photo upload

  await FirebaseFirestore.instance
      .collection('sites')
      .doc(widget.siteId)
      .collection('reports')
      .add({
    'urchinDensity': urchinDensity,
    'kelpPresent': kelpPresent,
    'latitude': position.latitude,
    'longitude': position.longitude,
   // 'photoUrl': photoUrl,
    'timestamp': FieldValue.serverTimestamp(),
  });

  setState(() => isSubmitting = false);
  Navigator.pop(context);
}

@override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(
      backgroundColor: Colors.teal,
      title: const Text(
        'Submit Report',
        style: TextStyle(color: Colors.white),
      ),
      iconTheme: const IconThemeData(color: Colors.white),
    ),
    body: Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Urchin Density',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          DropdownButton<String>(
            value: urchinDensity,
            items: ['low', 'medium', 'high']
                .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                .toList(),
            onChanged: (val) => setState(() => urchinDensity = val!),
          ),
          const SizedBox(height: 24),
          const Text(
            'Kelp Present?',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          Switch(
            value: kelpPresent,
            activeColor: Colors.teal,
            onChanged: (val) => setState(() => kelpPresent = val),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.teal,
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
            ),
            onPressed: pickPhoto,
            icon: const Icon(Icons.camera_alt, color: Colors.white),
            label: const Text(
              'Take Photo',
              style: TextStyle(color: Colors.white),
            ),
          ),
          if (selectedPhoto != null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Image.file(selectedPhoto!, height: 150),
            ),
          const SizedBox(height: 40),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              onPressed: isSubmitting ? null : submitReport,
              child: isSubmitting
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text(
                      'Submit Report',
                      style: TextStyle(color: Colors.white, fontSize: 16),
                    ),
            ),
          ),
        ],
      ),
    ),
  );
}
}