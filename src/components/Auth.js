import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import './Auth.css';

/**
 * Componente Auth - gestisce login, registrazione e password dimenticata.
 *
 * NOTA SULL'AUTORIZZAZIONE:
 * La registrazione è aperta a chiunque, ma le regole di sicurezza Firebase
 * (file firebase-rules.json) impediscono a chi non è nella whitelist UID
 * di leggere/scrivere prenotazioni. Quindi anche se un estraneo si registra,
 * non vedrà nulla e non potrà prenotare.
 */
function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const translateError = (code) => {
    const map = {
      'auth/invalid-email': 'Indirizzo email non valido.',
      'auth/user-disabled': 'Questo account è stato disabilitato.',
      'auth/user-not-found': 'Nessun account trovato con questa email.',
      'auth/wrong-password': 'Password errata.',
      'auth/invalid-credential': 'Credenziali non valide.',
      'auth/email-already-in-use': 'Esiste già un account con questa email.',
      'auth/weak-password': 'La password deve avere almeno 6 caratteri.',
      'auth/network-request-failed': 'Errore di rete. Verificare la connessione.',
      'auth/too-many-requests': 'Troppi tentativi. Riprovare più tardi.',
    };
    return map[code] || 'Si è verificato un errore. Riprovare.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!displayName.trim()) {
          setError('Inserire il proprio nome.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('La password deve avere almeno 6 caratteri.');
          setLoading(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: displayName.trim() });
        setInfo(
          'Registrazione completata. Comunica al gestore dell\'app il tuo UID per essere autorizzato.'
        );
      } else if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email);
        setInfo('Ti abbiamo inviato un\'email per reimpostare la password.');
      }
    } catch (err) {
      setError(translateError(err.code));
    }
    setLoading(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setInfo('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">BoatBooking</h1>
        <p className="auth-subtitle">Calendario condiviso dell&apos;imbarcazione</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Nome (es. Marco)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="input-field"
              autoComplete="name"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
            autoComplete="email"
          />

          {mode !== 'reset' && (
            <input
              type="password"
              placeholder="Password (minimo 6 caratteri)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="input-field"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          )}

          <button type="submit" disabled={loading} className="auth-button">
            {loading
              ? 'Attendere...'
              : mode === 'register'
              ? 'Registrati'
              : mode === 'login'
              ? 'Accedi'
              : 'Invia email di reset'}
          </button>
        </form>

        {error && <p className="message error-message">{error}</p>}
        {info && <p className="message info-message">{info}</p>}

        <div className="auth-links">
          {mode === 'login' && (
            <>
              <button className="link-button" onClick={() => switchMode('register')}>
                Non hai un account? Registrati
              </button>
              <button className="link-button" onClick={() => switchMode('reset')}>
                Password dimenticata?
              </button>
            </>
          )}
          {mode === 'register' && (
            <button className="link-button" onClick={() => switchMode('login')}>
              Hai già un account? Accedi
            </button>
          )}
          {mode === 'reset' && (
            <button className="link-button" onClick={() => switchMode('login')}>
              Torna al login
            </button>
          )}
        </div>

        <div className="info-box">
          <h3>Come funziona</h3>
          <ul>
            <li>Ogni fratello crea il proprio account</li>
            <li>L&apos;amministratore autorizza i nuovi UID</li>
            <li>Le prenotazioni sono visibili a tutti gli autorizzati</li>
            <li>Solo l&apos;autore può modificare/eliminare la propria</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Auth;
