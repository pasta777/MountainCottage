const express = require('express');
const app = express();
const port = 3000;

app.get('/api/test', (req, res) => {
    res.json({message: 'Caoooooo'});
});

app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});