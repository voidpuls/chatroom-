const firebaseConfig = {
  apiKey: "AIzaSyCzWCwATHetD1doAPT71EYZ58rMIVUCbzo",
  authDomain: "karchurch-fc446.firebaseapp.com",
  databaseURL: "https://karchurch-fc446-default-rtdb.firebaseio.com",
  projectId: "karchurch-fc446",
  storageBucket: "karchurch-fc446.firebasestorage.app",
  messagingSenderId: "138280682293",
  appId: "1:138280682293:web:ebe530bb68557ca4a4827c",
  measurementId: "G-R59D2HJCKG"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();
const messagesCollection = firestore.collection('messages');
const usersCollection = firestore.collection('users');
