// Firebase Initialize (compat SDK)
var firebaseConfig = {
  apiKey: "AIzaSyBf1wzIhQb7wZyAOP0Ie9XMYjpYVV2tlLg",
  authDomain: "dmc-tourlink-2026.firebaseapp.com",
  projectId: "dmc-tourlink-2026",
  storageBucket: "dmc-tourlink-2026.firebasestorage.app",
  messagingSenderId: "154813391985",
  appId: "1:154813391985:web:065afde39152962be527d0"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var auth = firebase.auth();
