import express, { Request, Response } from 'express';

const app = express();
const port = 8080;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

const server = app.listen(port, () => {
  console.log(`Backend Application listening at http://localhost:${port}`);
});