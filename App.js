import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Chat from './components/Chat';
import AdminPanel from './components/AdminPanel';
import ThemeToggle from './components/ThemeToggle';
import './styles/index.css';
import './styles/themes.css';

function App() {
  const { currentUser } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="app">
      <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
      {currentUser ? (
        currentUser.role === 'admin' ? (
          <AdminPanel user={currentUser} />
        ) : (
          <Chat user={currentUser} />
        )
      ) : (
        <Auth />
      )}
    </div>
  );
}

export default App;