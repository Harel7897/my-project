const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');  // הוספנו את הספריה של session

const app = express();
const port = 4000;  // הפורט שבו השרת מאזין

// מגדירים שהשרת יגיש קבצים סטטיים מתוך תיקיית 'project5'
app.use(express.static(path.join(__dirname, '../project5')));

// הגדרת session
app.use(session({
    secret: 'your-secret-key',  // כדאי לשנות למפתח סודי
    resave: false,
    saveUninitialized: true
}));

// אפשרות לקרוא נתונים בפורמט JSON
app.use(bodyParser.json());

// קריאת אנשי קשר מ-JSON
function readContacts() {
    const data = fs.readFileSync(path.join(__dirname, 'contacts.json'));
    return JSON.parse(data);
}

// שמירת אנשי קשר ל-JSON
function saveContacts(contacts) {
    fs.writeFileSync(path.join(__dirname, 'contacts.json'), JSON.stringify(contacts, null, 2));
}

// דף התחברות - בדיקה אם שם משתמש וסיסמה נכונים
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'hk' && password === '1234') {
        req.session.loggedIn = true;  // שומרים שהמשתמש מחובר
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// הגדרת Route להצגת עמוד התחברות (login.html)
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// הגדרת Route לדף אנשי קשר - רק אם המשתמש מחובר
app.get('/contacts.html', (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/login.html');  // אם לא מחובר, מפנים לעמוד התחברות
    }
    res.sendFile(path.join(__dirname, 'contacts.html'));
});

// קריאת אנשי קשר
app.get('/contacts', (req, res) => {
    if (!req.session.loggedIn) {
        return res.status(403).json({ error: 'לא מחובר' });  // אם לא מחובר, לא נותנים גישה
    }
    const contacts = readContacts();
    res.json(contacts);
});

// הוספת איש קשר
app.post('/contacts', (req, res) => {
    if (!req.session.loggedIn) {
        return res.status(403).json({ error: 'לא מחובר' });
    }
    const { name, phone, email } = req.body;
    const contacts = readContacts();
    const newContact = { id: Date.now(), name, phone, email };
    contacts.push(newContact);
    saveContacts(contacts);
    res.json(newContact);
});

// מחיקת איש קשר
app.delete('/contacts/:id', (req, res) => {
    if (!req.session.loggedIn) {
        return res.status(403).json({ error: 'לא מחובר' });
    }
    const contactId = parseInt(req.params.id);
    let contacts = readContacts();
    contacts = contacts.filter(contact => contact.id !== contactId);
    saveContacts(contacts);
    res.json({ message: 'הקשר נמחק בהצלחה' });
});

// יציאה (Logout)
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('שגיאה בהתנתקות');
        }
        res.redirect('/login.html');  // אחרי ההתנתקות, מפנים לדף התחברות
    });
});

// השרת מאזין לפורט 4000
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
