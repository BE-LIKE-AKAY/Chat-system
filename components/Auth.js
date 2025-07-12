import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signInWithEmailAndPassword, signUp, resetPassword } from '../firebase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (forgotPassword) {
        const result = await resetPassword(email);
        if (result.success) {
          setSuccess('Password reset email sent!');
        } else {
          setError(result.error);
        }
      } else if (isLogin) {
        await signInWithEmailAndPassword(email, password);
      } else {
        const result = await signUp(email, password, username);
        if (result.success) {
          setSuccess('Account created! Waiting for admin approval.');
          setIsLogin(true);
        } else {
          setError(result.error);
        }
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <h2>{forgotPassword ? 'Reset Password' : isLogin ? 'Login' : 'Register'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        
        {!forgotPassword && (
          <>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            
            {!isLogin && (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
            )}
          </>
        )}

        <button type="submit">
          {forgotPassword ? 'Send Reset Email' : isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      <div className="auth-options">
        {!forgotPassword && (
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
        )}
        
        {isLogin && !forgotPassword && (
          <button onClick={() => setForgotPassword(true)}>
            Forgot Password?
          </button>
        )}
        
        {forgotPassword && (
          <button onClick={() => setForgotPassword(false)}>
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}