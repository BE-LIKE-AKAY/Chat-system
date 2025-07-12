import { useState, useEffect, useRef } from 'react';
import { 
  ref, 
  onValue, 
  sendMessage, 
  markMessageAsRead,
  searchUsers,
  initPresence,
  serverTimestamp
} from '../firebase';
import UserStatus from './UserStatus';
import Message from './Message';

export default function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize presence
    initPresence(user.uid);
    
    // Load messages if a user is selected
    if (selectedUser) {
      const chatId = [user.uid, selectedUser.id].sort().join('_');
      const messagesRef = ref(db, `messages/${chatId}`);
      
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const messagesData = [];
        snapshot.forEach((childSnapshot) => {
          const message = childSnapshot.val();
          messagesData.push({
            id: childSnapshot.key,
            ...message,
            // Mark messages as delivered if they're to me
            delivered: message.sender === user.uid || message.delivered,
            // Mark messages as read if I'm the sender or if they're already read
            read: message.sender === user.uid || message.read
          });
          
          // Mark received messages as read
          if (message.sender !== user.uid && !message.read) {
            markMessageAsRead(childSnapshot.key, chatId);
          }
        });
        
        setMessages(messagesData.sort((a, b) => a.timestamp - b.timestamp));
      });
      
      return () => unsubscribe();
    }
  }, [selectedUser, user.uid]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    
    await sendMessage(user.uid, selectedUser.id, newMessage);
    setNewMessage('');
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      const results = await searchUsers(searchTerm);
      setSearchResults(results.filter(u => u.id !== user.uid));
    }
  };

  return (
    <div className="chat-container">
      <UserStatus user={user} />
      
      <div className="chat-sidebar">
        <div className="user-search">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        
        <div className="user-list">
          {searchResults.map(user => (
            <div 
              key={user.id} 
              className={`user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              <span>{user.username}</span>
              <span className={`status ${user.online ? 'online' : 'offline'}`}>
                {user.online ? 'Online' : `Last seen: ${new Date(user.lastSeen).toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="chat-main">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h3>Chat with {selectedUser.username}</h3>
              <span className={`status ${selectedUser.online ? 'online' : 'offline'}`}>
                {selectedUser.online ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <div className="messages">
              {messages.map((message) => (
                <Message 
                  key={message.id} 
                  message={message} 
                  isCurrentUser={message.sender === user.uid} 
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="message-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}