# BoatBooking

Applicazione web per la gestione condivisa delle prenotazioni dell'imbarcazione di famiglia.

## Caratteristiche principali

- Calendario mensile interattivo con visualizzazione delle prenotazioni
- Distinzione visiva tra prenotazioni proprie, altrui e sovrapposte
- Controllo automatico delle sovrapposizioni con elenco dei conflitti
- Validazione lato client e server (regole Firebase)
- Whitelist UID per autorizzazione granulare
- Modifica e cancellazione delle proprie prenotazioni
- Filtri per prenotazioni future, passate o totali
- Sincronizzazione in tempo reale tra tutti gli utenti
- Design responsive (desktop, tablet, smartphone)

## Stack tecnologico

- React 18
- Firebase Realtime Database + Authentication
- date-fns (gestione date timezone-safe)
- gh-pages (deploy automatico)

## Struttura del progetto

```
boatbooking/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Auth.js + Auth.css
│   │   ├── Dashboard.js + Dashboard.css
│   │   ├── Calendar.js + Calendar.css
│   │   ├── BookingForm.js + BookingForm.css
│   │   └── BookingList.js + BookingList.css
│   ├── utils/
│   │   ├── dateHelpers.js
│   │   └── bookingValidation.js
│   ├── firebaseConfig.js
│   ├── App.js + App.css
│   ├── index.js
│   └── index.css
├── .env.example
├── .gitignore
├── firebase-rules.json
├── firebase-rules-NOTE.md
├── package.json
└── README.md
```

## Setup rapido

Vedere il file `GUIDA_PASSO_PASSO.md` (nella cartella superiore) per le istruzioni dettagliate. In sintesi:

1. Installare Node.js LTS (https://nodejs.org)
2. Creare progetto Firebase con Authentication (Email/Password) e Realtime Database
3. Copiare `.env.example` in `.env` e compilare con le proprie chiavi
4. `npm install`
5. `npm start` (test locale)
6. Push su GitHub e `npm run deploy`
7. Caricare `firebase-rules.json` nella console Firebase

## Architettura della sicurezza

L'applicazione implementa una sicurezza a tre livelli:

1. **Firebase Authentication**: ogni utente ha un account email/password con UID univoco
2. **Whitelist UID**: solo gli UID elencati in `authorized_users` possono accedere ai dati
3. **Regole di validazione**: ogni scrittura deve rispettare lo schema atteso (vedere `firebase-rules-NOTE.md`)

## Limitazioni note

- Il controllo di sovrapposizione tra prenotazioni è eseguito lato client. In contesti familiari di buona fede questo è accettabile; per scenari adversariali sarebbe necessaria la migrazione a Firestore.
- L'applicazione è ottimizzata per uso familiare (max 10-20 utenti simultanei). Per uso commerciale servirebbe un piano Firebase a pagamento.

## Licenza

Uso privato. Nessuna licenza pubblica.

## Autore

Renato De Falco — 2026
