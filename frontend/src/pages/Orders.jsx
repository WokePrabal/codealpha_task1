// frontend/src/pages/Orders.jsx
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaTruck, FaBoxOpen, FaCheckCircle } from 'react-icons/fa';

export default function Orders(){
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(()=>{
    if (!user) { setLoading(false); return; }
    let mounted = true;
    (async ()=>{
      try {
        setLoading(true);
        const { data } = await api.get('/orders/myorders'); // ensure backend route exists
        if (!mounted) return;
        setOrders(data);
      } catch (e) {
        console.error(e);
        if (mounted) setErr('Failed to load orders.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return ()=> mounted = false;
  }, [user]);

  if (!user) return (
    <div className="container" style={{marginTop:32}}>
      <div className="card" style={{padding:24, textAlign:'center'}}>
        <h3>Please sign in</h3>
        <p className="muted">You need an account to view your orders.</p>
        <Link to="/login" className="btn-primary">Sign in</Link>
      </div>
    </div>
  );

  return (
    <div className="container" style={{marginTop:28}}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
        <h2>Your Orders</h2>
        <div className="muted small">{orders.length} order{orders.length !== 1 ? 's' : ''}</div>
      </header>

      {loading && <p>Loading orders…</p>}
      {err && <div className="error">{err}</div>}

      {!loading && !orders.length && (
        <div className="card" style={{padding:24, textAlign:'center'}}>
          <h3>No orders yet</h3>
          <p className="muted">Start shopping and your orders will appear here.</p>
          <Link to="/" className="btn-primary">Shop now</Link>
        </div>
      )}

      <div style={{display:'grid', gap:16}}>
        {orders.map(o => (
          <article className="order-card" key={o._id}>
            <div className="order-head">
              <div>
                <strong>Order #{String(o._id).slice(-6).toUpperCase()}</strong>
                <div className="muted small">{new Date(o.createdAt).toLocaleString()}</div>
              </div>

              <div style={{textAlign:'right'}}>
                <div className="muted small">Items: {o.orderItems.length}</div>
                <div style={{fontWeight:700, marginTop:6}}>₹{Number(o.totalPrice).toFixed(2)}</div>
              </div>
            </div>

            <div className="order-body">
              <div className="order-items">
                {o.orderItems.slice(0,4).map(it => (
                  <div className="mini-item" key={it.product}>
                    <img src={it.image} alt={it.name} />
                    <div style={{fontSize:13}}>
                      <div style={{fontWeight:600}}>{it.name}</div>
                      <div className="muted small">Qty: {it.qty}</div>
                    </div>
                    <div style={{marginLeft:'auto', fontWeight:700}}>₹{Number(it.price*it.qty).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="order-meta">
                <div className={`status ${o.isDelivered ? 'delivered' : (o.isShipped ? 'shipped' : 'processing')}`}>
                  {o.isDelivered ? <><FaCheckCircle/> Delivered</> : (o.isShipped ? <><FaTruck/> Shipped</> : <><FaBoxOpen/> Processing</>)}
                </div>
                <Link to={`/orders/${o._id}`} className="btn-outline">View details</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
