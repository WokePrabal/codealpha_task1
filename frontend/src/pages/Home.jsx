import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Hero from '../components/Hero';

export default function Home(){
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      const { data } = await api.get('/products');
      setProducts(data);
      setLoading(false);
    })();
  },[]);

  return (
    <>
      <Hero />
      <div id="catalog" className="grid">
        {loading ? <p>Loading...</p> :
          products.map(p => <ProductCard key={p._id} p={p} />)}
      </div>
    </>
  );
}
