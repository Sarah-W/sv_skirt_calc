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
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_API_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  catch(error) {
    console.error('Error writing new message to Firebase Database', error);
  }
}

async function updateSkirt(oldskirt,skirt,_pieces){
  let sk = {...oldskirt.data}
  sk.skirt=skirt
  sk._pieces = _pieces
  await setDoc(doc(db,'skirts',oldskirt.id),{...sk,updatedAt: serverTimestamp()})
}

async function deleteSkirt(id){
  await deleteDoc(doc(db, "skirts",id))
  return "done"
}

const skirtlist = writable([])

function loadMessages(usr) {

  console.log(usr)

  if (usr){
   const recentMessagesQuery = query(collection(getFirestore(), 'skirts'), where("user","==",usr.uid), orderBy('createdAt', 'desc'));
   
    // Start listening to the query.
    return onSnapshot(recentMessagesQuery, function(snapshot) {
      skirtlist.set(snapshot.docs.map(x=>({data:x.data(),id:x.id})))
    });
  }
  return ()=>{}
}

snapshotUnsubscribe = loadMessages()

export {app,signIn,signUserOut,user,saveSkirt,skirtlist,updateSkirt,deleteSkirt}
