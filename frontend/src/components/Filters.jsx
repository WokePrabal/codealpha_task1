import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Filters({ onChange }) {
  // keep UI controlled by URL params so results persist/shareable
  const [params, _setParams] = useSearchParams();
  const navigate = useNavigate();

  const qCategory = params.get('category') || '';
  const qBrand = params.get('brand') || '';
  const qMin = params.get('min') || '';
  const qMax = params.get('max') || '';
  const qSort = params.get('sort') || '';
  const qRating = params.get('rating') || '';

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    // derive categories/brands from backend (small call)
    (async ()=>{
      try {
        const res = await api.get('/products?limit=200'); // small dataset
        const list = Array.isArray(res.data) ? res.data : (res.data.products || []);
        setCategories([...new Set(list.map(p=>p.category).filter(Boolean))]);
        setBrands([...new Set(list.map(p=>p.brand).filter(Boolean))]);
      } catch(e){ console.error(e); }
    })();
  }, []);

  const apply = (next) => {
    // merge current params with next and navigate
    const nextParams = new URLSearchParams(Object.fromEntries([...params]));
    Object.keys(next || {}).forEach(k => {
      if (next[k] === null || next[k] === '') nextParams.delete(k);
      else nextParams.set(k, next[k]);
    });
    navigate(`/search?${nextParams.toString()}`);
    onChange && onChange(Object.fromEntries(nextParams));
  };

  return (
    <aside className="filters">
      <div className="filter-block">
        <h4>Category</h4>
        {categories.map(c => (
          <button key={c} className={`chip ${qCategory===c? 'active':''}`} onClick={()=>apply({ category: qCategory===c ? '' : c })}>{c}</button>
        ))}
      </div>

      <div className="filter-block">
        <h4>Brand</h4>
        {brands.map(b => (
          <button key={b} className={`chip ${qBrand===b? 'active':''}`} onClick={()=>apply({ brand: qBrand===b ? '' : b })}>{b}</button>
        ))}
      </div>

      <div className="filter-block">
        <h4>Price</h4>
        <div style={{display:'flex',gap:8}}>
          <input placeholder="min" value={qMin} onChange={e=>apply({ min: e.target.value })} />
          <input placeholder="max" value={qMax} onChange={e=>apply({ max: e.target.value })} />
        </div>
      </div>

      <div className="filter-block">
        <h4>Rating</h4>
        {[4,3,2,1].map(r=>(
          <button key={r} className={`chip ${Number(qRating)===r? 'active':''}`} onClick={()=>apply({ rating: qRating===String(r)? '' : String(r) })}>{r}★ & up</button>
        ))}
      </div>

      <div className="filter-block">
        <h4>Sort</h4>
        <select value={qSort} onChange={e=>apply({ sort: e.target.value })}>
          <option value="">Default</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="rating_desc">Top Rated</option>
        </select>
      </div>
    </aside>
  );
}
