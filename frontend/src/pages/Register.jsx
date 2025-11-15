import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register(){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const { register } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e)=>{
    e.preventDefault();
    try{ await register(name, email, password); nav('/'); }
    catch(e){ setErr(e.response?.data?.message || 'Register failed'); }
  };

  return (
    <form className="auth" onSubmit={onSubmit}>
      <h2>Create account</h2>
      {err && <p className="error">{err}</p>}
      <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="btn" type="submit">Register</button>
    </form>
  );
}
