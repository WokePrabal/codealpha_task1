// frontend/src/pages/SearchResults.jsx
import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Filters from '../components/Filters';

export default function SearchResults(){
  const location = useLocation();
  const qParam = new URLSearchParams(location.search).get('q') || '';
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try {
        setLoading(true);
        setError('');
        // Pass entire query string to backend so filters + sort work
        const qs = location.search.startsWith('?') ? location.search.slice(1) : location.search;
        const url = `/products?${qs}&limit=48`;
        const res = await api.get(url);
        // backend returns plain array (for compatibility) or { products: [...] }
        const list = Array.isArray(res.data) ? res.data : (res.data.products || []);
        if (!mounted) return;
        setProducts(list);
      } catch (err) {
        console.error('Search fetch error', err);
        if (mounted) setError('Something went wrong while searching.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return ()=> mounted = false;
  }, [location.search]);

  return (
    <div className="container" style={{display:'grid', gridTemplateColumns: '280px 1fr', gap:24}}>
      <aside>
        <Filters />
      </aside>

      <main>
        <header style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',margin:'6px 0 18px'}}>
          <div>
            <h2 style={{margin:0}}>Search results for “{qParam}”</h2>
            <div className="muted small" style={{marginTop:6}}>
              {products.length} result{products.length !== 1 ? 's' : ''} {qParam ? `for "${qParam}"` : ''}
            </div>
          </div>
          <Link to="/" className="link">Clear search</Link>
        </header>

        {loading && <p>Loading…</p>}
        {error && <p className="muted">{error}</p>}

        {!loading && !error && (
          products.length ? (
            <div className="grid">
              {products.map(p => <ProductCard key={p._id} p={p} />)}
            </div>
          ) : (
            <div style={{padding:40,textAlign:'center'}}>
              <h3>No results found</h3>
              <p className="muted">Try different keywords or adjust filters.</p>
            </div>
          )
        )}
      </main>
    </div>
  );
}
