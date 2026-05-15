
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// FOR YOU: PASTE YOUR FIREBASE CONFIG OBJECT HERE
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const saveSensorData = async (data) => {
  try {
    console.log("Attempting to save data to Firebase:", data);
    const docRef = await addDoc(collection(db, "sensorReadings"), {
      ...data,
      timestamp: new Date(),
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
    console.error("Data that failed to save:", data);
  }
};

const getSensorData = async () => {
  try {
    const q = query(collection(db, "sensorReadings"), orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });
    return data;
  } catch (e) {
    console.error("Error getting documents: ", e);
    return [];
  }
};

export { db, saveSensorData, getSensorData };
