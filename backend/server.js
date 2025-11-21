// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// 1) Load env + connect DB
dotenv.config();
await connectDB();

// 2) Create app
const app = express();
app.use(express.json());

// 3) CORS CONFIG  🔥 (ye hi main part hai)
const allowedOrigins = [
  process.env.CORS_ORIGIN,                   // Render pe set karega
  'http://localhost:5173',                   // local dev (Vite)
  'https://codealpha-task1-flame.vercel.app' // Vercel frontend
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Postman / curl ke liye origin null hota hai — unko allow kar do
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false); // block rest (ya new Error() bhi kar sakta hai)
  },
  credentials: true
};

app.use(cors(corsOptions));

// extra safeguard for preflight
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 4) Logging
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Health check
app.get('/', (req, res) => res.send('API is running'));

// 5) Unsplash image proxy (Node 18+ global fetch)
app.get('/img/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const w = Number(req.query.w) || 900;
    const upstream = `https://unsplash.com/photos/${id}/download?force=true&w=${w}`;

    const r = await fetch(upstream, { redirect: 'follow' });
    if (!r.ok) return res.status(502).send('Upstream error');

    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');

    const buf = Buffer.from(await r.arrayBuffer());
    return res.send(buf);
  } catch (e) {
    console.error('IMG proxy error:', e.message);
    return res.status(500).send('Image proxy failed');
  }
});

// 6) API routes
app.use('/api/users', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);

// 7) Errors
app.use(notFound);
app.use(errorHandler);

// 8) Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
