# Note Tecniche sulle Regole Firebase

## Cosa fanno queste regole

Il file `firebase-rules.json` configura il comportamento di sicurezza del Realtime Database. Nello specifico:

### 1. Whitelist UID (sicurezza primaria)

Solo gli utenti autenticati il cui UID compare nel nodo `authorized_users` con valore `true` possono leggere o scrivere nel nodo `bookings`. Questo significa che anche se un estraneo si registra all'app, non potrà vedere alcuna prenotazione né crearne di nuove.

### 2. Solo il proprietario può modificare/cancellare

La regola `.write` a livello di `$bookingId` consente la scrittura solo se:
- L'utente è autenticato e autorizzato
- E (la prenotazione non esiste ancora, cioè è una creazione) **OPPURE** (la prenotazione esiste e il `userId` salvato corrisponde all'utente loggato)

Questo impedisce a un fratello di modificare o cancellare le prenotazioni di un altro.

### 3. Validazione del formato dei dati

Le regole `.validate` impongono:
- Le date devono essere stringhe in formato `YYYY-MM-DD`
- La `endDate` deve essere `>= startDate`
- Il `userId` salvato deve coincidere con quello dell'utente loggato (impedisce di "fingersi" un altro)
- Il `userName` deve essere una stringa di 1-100 caratteri
- Le `notes` non possono superare i 200 caratteri
- Non sono ammessi campi extra non previsti (`$other: false`)

### 4. Index per performance

`.indexOn` su `startDate`, `endDate` e `userId` accelera le query future se in futuro si aggiungeranno filtri server-side.

---

## Come ottenere gli UID dei fratelli

1. Ogni fratello completa la registrazione tramite l'app (email + password + nome)
2. Dopo la registrazione, l'app mostra l'UID nella pagina di errore "Accesso non autorizzato"
3. Lei (Renato) raccoglie gli UID e li inserisce nel file delle regole sostituendo i placeholder
4. Pubblica le nuove regole nella Firebase Console

---

## Limitazione nota: assenza di controllo overlap server-side

Le regole Firebase Realtime Database **non** possono eseguire controlli che richiedono di leggere altri record del database al momento della scrittura (a differenza di Firestore con `get()`). Pertanto il controllo di sovrapposizione tra prenotazioni è eseguito **solo lato client** (nel componente Dashboard / BookingForm).

In uno scenario familiare di buona fede questo è accettabile, perché:
1. Il client esegue sempre la validazione prima del submit
2. Il bottone "Conferma" è disabilitato se rileva conflitti
3. Le prenotazioni esistenti sono visibili a tutti gli autorizzati

**Per una sicurezza assoluta** (indispensabile in un contesto enterprise/commerciale), occorrerebbe migrare a Firestore e implementare il controllo overlap nelle Security Rules con `get()`, oppure usare Cloud Functions come "trigger" sulla scrittura.

In ambito familiare, questo livello di rigore aggiuntivo è **sproporzionato** rispetto al rischio reale.
