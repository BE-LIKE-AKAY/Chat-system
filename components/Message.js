export default function Message({ message, isCurrentUser }) {
  return (
    <div className={`message ${isCurrentUser ? 'sent' : 'received'}`}>
      <div className="message-content">
        <p>{message.text}</p>
        <div className="message-meta">
          <span className="time">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          {isCurrentUser && (
            <span className="status">
              {message.read ? '✓✓' : message.delivered ? '✓' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}