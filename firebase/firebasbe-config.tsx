import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'
import {getStorage} from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDBaAuQrTgTN-rt6oZiMGlmelxtdS3eMcU",
  authDomain: "real-time-chat-app-fcfeb.firebaseapp.com",
  projectId: "real-time-chat-app-fcfeb",
  storageBucket: "real-time-chat-app-fcfeb.appspot.com",
  messagingSenderId: "485390281691",
  appId: "1:485390281691:web:f3f5de41203228139d15fe"
};

const app = initializeApp(firebaseConfig)
export const db = getFirestore()
export const auth = getAuth()
export const storage = getStorage()