const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const apiRoutes = require('./routes/api');
app.use('/', apiRoutes);

app.get('/ping', (req, res) => res.status(200).send('pong'));

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
