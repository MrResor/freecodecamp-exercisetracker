import express from 'express';

const mainView = express.Router();

mainView.get('/', (_, res) => {
    res.sendFile('./views/index.html', { root: '.' });
});

export { mainView };