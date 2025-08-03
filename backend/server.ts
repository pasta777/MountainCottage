import express, { Express, Request, Response } from "express";
import cors from 'cors';

const app: Express = express();
const port: number = 3000;

app.use(cors());

app.get('/api/test', (req: Request, res: Response) => {
    res.json({message: 'Pozzz'});
});

app.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
});