import { Link } from 'react-router-dom';

export default function ProductCard({ p }){
  return (
    <article className="product-card">
      <Link to={`/product/${p._id}`} className="thumb-wrap">
        <img src={p.image} alt={p.name} loading="lazy" />
      </Link>
      <div className="card-body">
        <Link to={`/product/${p._id}`} className="product-title">{p.name}</Link>
        <div className="muted small">{p.brand} • {p.category}</div>
        <div className="card-footer">
          <div className="price">₹{p.price}</div>
          <Link to={`/product/${p._id}`} className="btn-sm">View</Link>
        </div>
      </div>
    </article>
  );
}
