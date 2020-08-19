require('rootpath')();
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('API Robotics Competitions'));

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
