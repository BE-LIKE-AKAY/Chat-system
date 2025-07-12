import { useState, useEffect } from 'react';
import { ref, onValue, update } from '../firebase';
import UserStatus from './UserStatus';

export default function AdminPanel({ user }) {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  useEffect(() => {
    // Load all users
    const usersRef = ref(db, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const usersData = [];
      const pending = [];
      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        usersData.push({
          id: childSnapshot.key,
          ...userData
        });
        
        if (userData.pendingApproval) {
          pending.push({
            id: childSnapshot.key,
            ...userData
          });
        }
      });
      setUsers(usersData);
      setPendingApprovals(pending);
    });
    
    // Load logs
    const logsRef = ref(db, 'logs');
    const unsubscribeLogs = onValue(logsRef, (snapshot) => {
      const logsData = [];
      snapshot.forEach((childSnapshot) => {
        logsData.push({
          timestamp: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      setLogs(logsData.reverse());
    });
    
    return () => {
      unsubscribeUsers();
      unsubscribeLogs();
    };
  }, []);

  const handleApproveUser = async (userId) => {
    await update(ref(db, `users/${userId}`), { pendingApproval: false });
  };

  const handleChangeRole = async (userId, newRole) => {
    await update(ref(db, `users/${userId}`), { role: newRole });
  };

  return (
    <div className="admin-panel">
      <UserStatus user={user} />
      
      <div className="admin-section">
        <h2>Pending Approvals</h2>
        {pendingApprovals.length > 0 ? (
          <ul className="approval-list">
            {pendingApprovals.map(user => (
              <li key={user.id}>
                <span>{user.username} ({user.email})</span>
                <button onClick={() => handleApproveUser(user.id)}>Approve</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No pending approvals</p>
        )}
      </div>
      
      <div className="admin-section">
        <h2>User Management</h2>
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.online ? 'Online' : 'Offline'}</td>
                <td>
                  <select 
                    value={user.role} 
                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  {user.pendingApproval && (
                    <button onClick={() => handleApproveUser(user.id)}>
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="admin-section">
        <h2>System Logs</h2>
        <div className="logs-container">
          {logs.map(log => (
            <div key={log.timestamp} className="log-entry">
              <span className="log-time">
                {new Date(parseInt(log.timestamp)).toLocaleString()}
              </span>
              <span className="log-type">{log.type}</span>
              <span className="log-details">{log.details}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}