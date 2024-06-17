const express = require("express");
const cors = require('cors');
const app = express();

const admin = require("firebase-admin");
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const credentials = require("./password-manager-b42ad-firebase-adminsdk-dhb31-725c558e44.json");

admin.initializeApp({
    credential: admin.credential.cert(credentials)
});

const db = getFirestore();

app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.get('/verifyUserToken', async (req, res) => {
    const authToken = req.headers.authorization.split(' ')[1];
    try {
        const decodeValue = await admin.auth().verifyIdToken(authToken);
        console.log(decodeValue);
        if (decodeValue) {
            return res.status(200).json({ message: 'Access Granted' });
        }
        return res.status(400).json({ message: 'Unauthorized Access' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/addPassword', async (req, res) => {
    const passwords = db.collection('passwords');
    const authToken = req.headers.authorization.split(' ')[1];
    try {
        const decodeValue = await admin.auth().verifyIdToken(authToken);
        if (decodeValue && decodeValue.uid == req.body.uid && decodeValue.email_verified == true) {
            await passwords.add(req.body);
            return res.status(200).json({ message : "Password Added Successfully"});
        }
        return res.status(400).json({ message: 'Unauthorized Access' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/getPasswords', async (req, res) => {
    const passwords = db.collection('passwords');
    const authToken = req.headers.authorization.split(' ')[1];
    try{
        const decodeValue = await admin.auth().verifyIdToken(authToken);
        if (decodeValue && decodeValue.uid == req.body.uid && decodeValue.email_verified == true) {
            const snapshot = await passwords.where('uid', '==', req.body.uid).get();
            const list = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
            return res.status(200).json(list);
        }
        else{
            return res.status(400).json({ message: 'Unauthorized Access' });
        }
    }
    catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
})