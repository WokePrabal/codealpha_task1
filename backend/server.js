import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import wishlistRoutes from './routes/wishlistRoutes.js';


// 1) Load env + connect DB
dotenv.config();
await connectDB();

// 2) Create app and middlewares
const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/', (req, res) => res.send('API is running'));

// 3) Image proxy (AFTER app init). Using Node 18+ global fetch (no node-fetch needed)
app.get('/img/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const w = Number(req.query.w) || 900;
    const upstream = `https://unsplash.com/photos/${id}/download?force=true&w=${w}`;

    const r = await fetch(upstream, { redirect: 'follow' });
    if (!r.ok) return res.status(502).send('Upstream error');

    res.set('Content-Type', 'image/jpeg'); // force inline render
    res.set('Cache-Control', 'public, max-age=31536000, immutable');

    const buf = Buffer.from(await r.arrayBuffer());
    return res.send(buf);
  } catch (e) {
    console.error('IMG proxy error:', e.message);
    return res.status(500).send('Image proxy failed');
  }
});

// 4) API routes
app.use('/api/users', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);

// 5) Errors
app.use(notFound);
app.use(errorHandler);

// 6) Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
