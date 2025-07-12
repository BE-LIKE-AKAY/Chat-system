import { useEffect, useState } from 'react';
import { ref, onValue } from '../firebase';

export default function UserStatus({ user }) {
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    const presenceRef = ref(db, 'presence');
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const users = [];
      snapshot.forEach((childSnapshot) => {
        if (childSnapshot.val().status === 'online') {
          users.push(childSnapshot.key);
        }
      });
      setOnlineUsers(users.length);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <div className="user-status">
      <div className="user-info">
        <span className="username">{user.username || user.email}</span>
        <span className="role">{user.role}</span>
      </div>
      <div className="online-count">
        {onlineUsers} user{onlineUsers !== 1 ? 's' : ''} online
      </div>
    </div>
  );
}