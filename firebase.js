import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getDatabase, 
  ref, 
  push, 
  set, 
  onValue,
  update,
  onDisconnect,
  serverTimestamp,
  query,
  orderByChild,
  startAt,
  endAt,
  get
} from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBjh67gaNfzBTk1gNTA-bhvgZG4YX0bjeQ",
            authDomain: "friends-195c7.firebaseapp.com",
            databaseURL: "https://friends-195c7-default-rtdb.firebaseio.com",
            projectId: "friends-195c7",
            storageBucket: "friends-195c7.firebasestorage.app",
            messagingSenderId: "487210823099",
            appId: "1:487210823099:web:30fb0fb91cd484486e289e",
            measurementId: "G-PSLN4J6DGL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Auth functions
const signUp = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await set(ref(db, `users/${user.uid}`), {
      username,
      email,
      role: 'user',
      createdAt: Date.now(),
      online: true,
      lastSeen: Date.now(),
      pendingApproval: true
    });
    
    await set(ref(db, `userIndex/${username.toLowerCase()}`), user.uid);
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Database functions
const sendMessage = async (senderId, receiverId, text) => {
  const chatId = [senderId, receiverId].sort().join('_');
  const messageRef = push(ref(db, `messages/${chatId}`));
  
  const message = {
    sender: senderId,
    text,
    timestamp: serverTimestamp(),
    delivered: false,
    read: false
  };
  
  await set(messageRef, message);
  return messageRef.key;
};

const markMessageAsRead = (messageId, chatId) => {
  update(ref(db, `messages/${chatId}/${messageId}`), { read: true });
};

const searchUsers = async (searchTerm) => {
  const usersRef = ref(db, 'users');
  const searchQuery = query(
    usersRef,
    orderByChild('username'),
    startAt(searchTerm.toLowerCase()),
    endAt(searchTerm.toLowerCase() + '\uf8ff')
  );
  
  const snapshot = await get(searchQuery);
  const results = [];
  snapshot.forEach((childSnapshot) => {
    results.push({
      id: childSnapshot.key,
      ...childSnapshot.val()
    });
  });
  return results;
};

// Presence system
const initPresence = (userId) => {
  const presenceRef = ref(db, `presence/${userId}`);
  const userRef = ref(db, `users/${userId}`);
  
  set(presenceRef, {
    status: 'online',
    lastChanged: serverTimestamp()
  });
  
  update(userRef, {
    online: true,
    lastSeen: serverTimestamp()
  });
  
  onDisconnect(presenceRef).set({
    status: 'offline',
    lastChanged: serverTimestamp()
  });
  
  onDisconnect(userRef).update({
    online: false,
    lastSeen: serverTimestamp()
  });
};

// Admin functions
const getSystemLogs = async (limit = 100) => {
  const logsRef = ref(db, 'logs');
  const logsQuery = query(logsRef, orderByKey(), limitToLast(limit));
  
  const snapshot = await get(logsQuery);
  const logs = [];
  snapshot.forEach((childSnapshot) => {
    logs.push({
      timestamp: childSnapshot.key,
      ...childSnapshot.val()
    });
  });
  return logs.reverse();
};

export { 
  auth,
  db,
  signInWithEmailAndPassword,
  signUp,
  signOut,
  resetPassword,
  onAuthStateChanged,
  ref,
  onValue,
  sendMessage,
  markMessageAsRead,
  searchUsers,
  initPresence,
  getSystemLogs,
  serverTimestamp
};