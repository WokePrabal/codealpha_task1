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

// 1) env + DB
dotenv.config();
await connectDB();

// 2) app
const app = express();
app.use(express.json());

// 3) SIMPLE CORS  🔥  (no origin list drama)
app.use(
  cors({
    origin: true,          // jo origin se request aayegi, wahi reflect karega
    credentials: true
  })
);

// preflight ke liye
//app.options('*', cors());

// debug ke liye origin log (render logs me dikh jayega)
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Origin:', req.headers.origin || 'none', 'Path:', req.path);
  }
  next();
});

// 4) logging
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// 5) health check
app.get('/', (req, res) => res.send('API is running'));

// 6) Unsplash image proxy – Node 18+ global fetch
app.get('/img/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const w = Number(req.query.w) || 900;
    const upstream = `https://unsplash.com/photos/${id}/download?force=true&w=${w}`;

    const r = await fetch(upstream, { redirect: 'follow' });
    if (!r.ok) return res.status(502).send('Upstream error');

    const contentType = r.headers.get('content-type') || 'image/jpeg';
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');

    const buf = Buffer.from(await r.arrayBuffer());
    return res.send(buf);
  } catch (e) {
    console.error('IMG proxy error:', e.message);
    return res.status(500).send('Image proxy failed');
  }
});

// 7) API routes
app.use('/api/users', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);

// 8) error handlers
app.use(notFound);
app.use(errorHandler);

// 9) start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
