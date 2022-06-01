// Import the functions you need from the SDKs you need
import { writable } from 'svelte/store';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {  
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
    } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  where,
  limit,
  onSnapshot,
  setDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1PW68JjOVDRffJLnZ4hJYzIxWqZOYelU",
  authDomain: "skirtcalc.firebaseapp.com",
  projectId: "skirtcalc",
  storageBucket: "skirtcalc.appspot.com",
  messagingSenderId: "869977279673",
  appId: "1:869977279673:web:c8f4c81fffc92e7ab69f68",
  measurementId: "G-LPK8JD10J8"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);

  const app = initializeApp(firebaseConfig)
  // const analytics = getAnalytics(app)
  // const auth = getAuth(app)
  let db = getFirestore(app)
  // const userDoc = (userId) => doc(db, "users", userId)

  let snapshotUnsubscribe = ()=>{}
  const user = writable({uid:0})

  function authStateObserver(u){
    snapshotUnsubscribe()
    skirtlist.set([])
    user.set(u)
    snapshotUnsubscribe = loadMessages(u)
  }

  onAuthStateChanged(getAuth(), authStateObserver)

async function signIn() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new GoogleAuthProvider();
  await signInWithPopup(getAuth(), provider);
}

function signUserOut() {
  // Sign out of Firebase.
  signOut(getAuth());
}

async function saveSkirt(skirtname,user,skirt,_pieces){
  // Add a new message entry to the Firebase database.
  try {
    await addDoc(collection(getFirestore(), 'skirts'), {
      user: user.uid,
      skirtname:skirtname,
      skirt: skirt,
      _pieces:_pieces,
      timestamp: serverTimestamp()
    });
  }
  catch(error) {
    console.error('Error writing new message to Firebase Database', error);
  }

}


const skirtlist = writable([])

function loadMessages(usr) {

  console.log(usr)

  if (usr){
    const recentMessagesQuery = query(collection(getFirestore(), 'skirts'), where("user","==",usr.uid), orderBy('timestamp', 'desc'));

    // Start listening to the query.
    return onSnapshot(recentMessagesQuery, function(snapshot) {
      skirtlist.set(snapshot.docs.map(x=>({data:x.data(),id:x.id})))
    });
  }
  return ()=>{}
}

snapshotUnsubscribe = loadMessages()

export {app,signIn,signUserOut,user,saveSkirt,skirtlist}
