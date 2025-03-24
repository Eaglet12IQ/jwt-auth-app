const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'AGA';

app.use(bodyParser.json());
app.use(cors());

let users = [];

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Forbidden: Недействительный токен' });
            }

            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ message: 'Unauthorized: Токен не был отправлен' });
    }
};

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);
    if (user) {
        return res.status(400).json({ message: 'Пользователь уже зарегистрирован' });
    }

    const newUser = { username, password };
    users.push(newUser);

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Неверные данные для входа' });
    }

    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

app.get('/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'Защищенные данные' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порте ${PORT}`);
});