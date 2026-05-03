import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Caricamento in corso...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {user ? (
        <>
          <nav className="navbar">
            <div className="navbar-content">
              <h1>BoatBooking</h1>
              <div className="navbar-user">
                <span className="user-name">
                  {user.displayName || user.email}
                </span>
                <button className="logout-btn" onClick={handleLogout}>
                  Esci
                </button>
              </div>
            </div>
          </nav>
          <Dashboard user={user} />
        </>
      ) : (
        <Auth />
      )}
    </div>
  );
}

export default App;
