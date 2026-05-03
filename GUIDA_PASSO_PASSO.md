# BoatBooking — Guida Operativa Passo-Passo

**Per:** Renato De Falco
**Data:** 3 maggio 2026
**Obiettivo:** Portare l'applicazione BoatBooking dalla cartella di lavoro alla pubblicazione online accessibile dai Suoi fratelli.

---

## Sommario

1. Verifica dei prerequisiti
2. Installazione di Node.js
3. Creazione del progetto Firebase
4. Configurazione del file `.env`
5. Installazione delle dipendenze e test locale
6. Pubblicazione su GitHub
7. Deploy su GitHub Pages
8. Caricamento delle regole Firebase
9. Onboarding dei fratelli
10. Risoluzione problemi (FAQ)

---

## Capitolo 1 — Verifica dei prerequisiti

Prima di iniziare, verifichi di disporre di:

- Un account **GitHub** (https://github.com) — utenza `renato-antonio-marzia` come da indicazioni
- Un account **Google** (utilizzato per Firebase)
- Un computer Windows o Mac con almeno 2 GB di spazio libero
- Connessione Internet stabile

---

## Capitolo 2 — Installazione di Node.js

Node.js è l'ambiente che permette di eseguire React sul Suo computer.

1. Aprire il browser e andare su **https://nodejs.org**
2. Scaricare la versione **LTS** (Long Term Support) — attualmente la 20.x
3. Eseguire l'installer e accettare le opzioni predefinite
4. Al termine, aprire il **Prompt dei comandi** (su Windows: tasto Windows + R, digitare `cmd`, premere Invio)
5. Verificare l'installazione digitando:

```bash
node --version
npm --version
```

Dovrebbe vedere due numeri di versione (es. `v20.11.0` e `10.2.4`). Se vede errori, riavviare il computer e riprovare.

---

## Capitolo 3 — Creazione del progetto Firebase

Firebase è il "motore" che gestirà gli account utente e il database delle prenotazioni.

### 3.1 Creazione del progetto

1. Andare su **https://console.firebase.google.com**
2. Effettuare il login con il Suo account Google
3. Cliccare **"Aggiungi progetto"**
4. Nome del progetto: `boatbooking-defalco` (o nome preferito)
5. Disabilitare Google Analytics (non serve per questo progetto)
6. Cliccare **"Crea progetto"** e attendere il completamento

### 3.2 Attivazione Authentication

1. Nel menu di sinistra: **Build → Authentication**
2. Cliccare **"Inizia"**
3. Nella scheda "Sign-in method": cliccare **"Email/Password"**
4. Abilitare la prima opzione "Email/Password" (NON quella senza password)
5. Cliccare **"Salva"**

### 3.3 Attivazione Realtime Database

1. Nel menu di sinistra: **Build → Realtime Database**
2. Cliccare **"Crea database"**
3. **Posizione:** scegliere `europe-west1` (Belgio) — la più vicina all'Italia
4. **Modalità sicurezza:** scegliere **"Inizia in modalità di blocco"** (la metteremo a posto dopo)
5. Cliccare **"Abilita"**

### 3.4 Recupero delle chiavi di configurazione

1. In alto a sinistra cliccare l'**ingranaggio → Impostazioni progetto**
2. Scorrere fino alla sezione **"Le tue app"**
3. Cliccare l'icona **`</>`** (Web)
4. Nickname dell'app: `BoatBooking Web`
5. **NON** spuntare "Configura anche Firebase Hosting"
6. Cliccare **"Registra app"**
7. Comparirà un blocco di codice — copiare i valori `firebaseConfig`. Avranno questo aspetto:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "boatbooking-defalco.firebaseapp.com",
  databaseURL: "https://boatbooking-defalco-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "boatbooking-defalco",
  storageBucket: "boatbooking-defalco.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef..."
};
```

**Lasci aperta questa scheda**, ci servirà al capitolo successivo.

---

## Capitolo 4 — Configurazione del file `.env`

1. Aprire la cartella `boatbooking` che ho creato per Lei nella cartella di lavoro
2. Localizzare il file `.env.example`
3. Crearne una copia rinominandola **`.env`** (senza `.example`)
4. Aprire il file `.env` con un editor di testo (es. Blocco note)
5. Sostituire i valori `XXXXXX` con quelli copiati dalla console Firebase. Esempio:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz12345
REACT_APP_FIREBASE_AUTH_DOMAIN=boatbooking-defalco.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://boatbooking-defalco-default-rtdb.europe-west1.firebasedatabase.app
REACT_APP_FIREBASE_PROJECT_ID=boatbooking-defalco
REACT_APP_FIREBASE_STORAGE_BUCKET=boatbooking-defalco.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef0123456789
```

6. Salvare il file e chiuderlo

---

## Capitolo 5 — Installazione delle dipendenze e test locale

1. Aprire il **Prompt dei comandi** (su Windows)
2. Spostarsi nella cartella `boatbooking`. Esempio:

```bash
cd C:\Users\Renatino\Documents\boatbooking
```

(adatti il percorso a dove ha copiato la cartella)

3. Installare le dipendenze:

```bash
npm install
```

Attendere 2-5 minuti. Vedrà un sacco di righe scorrere — è normale.

4. Avviare l'applicazione in modalità sviluppo:

```bash
npm start
```

5. Si aprirà automaticamente il browser su `http://localhost:3000`. Dovrebbe vedere la pagina di login di BoatBooking.

6. **Test funzionali da eseguire:**
   - Registrare un account con Sua email e una password (almeno 6 caratteri)
   - Vedrà il messaggio "Accesso non autorizzato" — è **corretto**, perché non ha ancora caricato le regole con il Suo UID. **Copi l'UID mostrato.**

7. Per fermare il server: tornare al Prompt dei comandi e premere `Ctrl + C`

---

## Capitolo 6 — Pubblicazione su GitHub

### 6.1 Creazione del repository su GitHub

1. Andare su **https://github.com/new**
2. Nome del repository: **`boatbooking`**
3. Visibilità: **Private** (raccomandato — è un progetto familiare)
4. NON selezionare alcuna opzione (no README, no .gitignore, no license)
5. Cliccare **"Create repository"**

### 6.2 Caricamento del codice

GitHub Le mostrerà alcuni comandi. Usi quelli sotto la voce **"…or push an existing repository from the command line"**.

Nel Prompt dei comandi, dentro la cartella `boatbooking`:

```bash
git init
git add .
git commit -m "Initial commit - BoatBooking"
git branch -M main
git remote add origin https://github.com/renato-antonio-marzia/boatbooking.git
git push -u origin main
```

Le verranno chieste le credenziali GitHub. Se non si ricorda la password, usi un **Personal Access Token** (Settings → Developer settings → Personal access tokens su GitHub).

---

## Capitolo 7 — Deploy su GitHub Pages

1. Nel Prompt, sempre dentro `boatbooking`, eseguire:

```bash
npm run deploy
```

Attendere 1-2 minuti. Vedrà comparire `Published`.

2. Andare su GitHub: il Suo repository → **Settings → Pages**
3. Verificare che la **Source** sia impostata su **"Deploy from a branch"**, ramo `gh-pages`
4. Salvare. Attendere 2-3 minuti.

5. La Sua app sarà accessibile a:

**https://renato-antonio-marzia.github.io/boatbooking/**

---

## Capitolo 8 — Caricamento delle regole Firebase

Adesso che ha l'UID del Suo account (copiato nel capitolo 5.6) e l'app è online, può attivare la sicurezza.

1. Aprire il file `firebase-rules.json` nella cartella `boatbooking`
2. Sostituire `UID_RENATO_PLACEHOLDER` con il Suo UID effettivo (esempio: `KjHs7g3FdY...`)
3. Lasciare gli altri due placeholder per ora (li aggiornerà quando i fratelli si registreranno)

Esempio:

```json
"authorized_users": {
  "KjHs7g3FdYabc123": true,
  "UID_FRATELLO_2_PLACEHOLDER": true,
  "UID_FRATELLO_3_PLACEHOLDER": true
},
```

4. Andare nella **Firebase Console → Realtime Database → Regole**
5. Cancellare tutto il contenuto attuale
6. Incollare il contenuto del Suo file `firebase-rules.json`
7. Cliccare **"Pubblica"**

8. **Test:** apra l'app online e si rilogghi. Adesso dovrebbe vedere il calendario e poter creare prenotazioni.

---

## Capitolo 9 — Onboarding dei fratelli

Per ciascun fratello:

1. Inviarli il link **https://renato-antonio-marzia.github.io/boatbooking/**
2. Devono registrarsi con la propria email e password
3. Vedranno il messaggio "Accesso non autorizzato" con il loro UID
4. Le inviano il loro UID (per messaggio, email, qualsiasi mezzo)
5. Lei aggiorna il file `firebase-rules.json` sostituendo i placeholder rimanenti
6. Ripubblica le regole nella Firebase Console (capitolo 8.4-8.7)
7. Il fratello si rilogga e adesso può prenotare

---

## Capitolo 10 — Risoluzione problemi (FAQ)

**Problema: "npm install" si blocca o dà errori**
→ Verificare la connessione Internet. Riprovare con `npm install --legacy-peer-deps`

**Problema: la pagina è bianca dopo il deploy**
→ Aprire la console del browser (F12). Verificare che le variabili Firebase siano corrette nel file `.env` PRIMA di aver fatto `npm run deploy`.

**Problema: "Accesso non autorizzato" anche dopo aver caricato le regole**
→ Verificare di aver copiato l'UID giusto nel file delle regole. L'UID è una stringa di circa 28 caratteri (es. `KjHs7g3FdYabc123XYZpqrSTU45`). NON l'email.

**Problema: le prenotazioni si vedono ma non si possono creare**
→ Aprire la console del browser e controllare l'errore. Probabilmente le regole `.validate` sono troppo restrittive o un campo è mancante. Controllare il file `firebase-rules-NOTE.md` per dettagli.

**Problema: dopo modifiche al codice, il browser mostra ancora la versione vecchia**
→ Premere `Ctrl + Shift + R` per ricaricare ignorando la cache. Per il deploy ripubblicare con `npm run deploy`.

**Problema: errore "git push" — Authentication failed**
→ GitHub non accetta più password normali. Generare un Personal Access Token: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token. Spuntare `repo`. Copiare il token e usarlo come "password" quando git lo chiede.

---

## Stima dei tempi

| Attività | Tempo |
|----------|-------|
| Installazione Node.js | 5 min |
| Creazione progetto Firebase | 10 min |
| Configurazione `.env` | 3 min |
| `npm install` | 5 min |
| Test locale | 5 min |
| Push su GitHub | 5 min |
| Deploy su GitHub Pages | 5 min |
| Caricamento regole Firebase | 5 min |
| **Totale** | **~45 minuti** |

---

## Risorse di approfondimento

- Documentazione Firebase: https://firebase.google.com/docs
- Documentazione React: https://react.dev/learn
- Documentazione GitHub Pages: https://docs.github.com/en/pages

---

*Per ulteriore assistenza, può tornare a chiedermi in qualsiasi momento. Sono a Sua disposizione per chiarimenti, modifiche o estensioni dell'applicazione.*
