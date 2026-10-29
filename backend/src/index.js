import 'dotenv/config';
import app from './app.js';
import { connectDb } from './config/db.js';

const port = Number(process.env.PORT || 5000);
connectDb()
  .then(() => app.listen(port, () => console.log(`Forever API running on http://localhost:${port}`)))
  .catch(error => {
    console.error('Database connection failed:', error.message);
    process.exitCode = 1;
  });
