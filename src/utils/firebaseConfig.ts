// Import the functions you need from the SDKs you need
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-890Xv2_6a-UH3ddhlcnyZ-43fq5_dQs",
  authDomain: "daytripper-prod.firebaseapp.com",
  databaseURL: "https://daytripper-prod-default-rtdb.firebaseio.com",
  projectId: "daytripper-prod",
  storageBucket: "daytripper-prod.firebasestorage.app",
  messagingSenderId: "659464658532",
  appId: "1:659464658532:web:eddf3ad0994a0cf8a1c971",
  measurementId: "G-QF2TE98651",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
