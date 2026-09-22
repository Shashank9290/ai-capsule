import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, getCapsules, createCapsule, updateCapsule, deleteCapsule, logout } from '../api';
import CapsuleForm from '../components/CapsuleForm';
import CapsuleList from '../components/CapsuleList';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [capsules, setCapsules] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setUser(me);
        const rows = await getCapsules();
        setCapsules(rows);
      } catch (err) {
        if (err.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleCreate = async (data) => {
    const created = await createCapsule(data);
    setCapsules((prev) => [created, ...prev]);
  };

  const handleUpdate = async (id, data) => {
    const updated = await updateCapsule(id, data);
    setCapsules((prev) => prev.map((c) => (c.id === id ? updated : c)));
    setEditing(null);
  };

  const handleDelete = async (id) => {
    await deleteCapsule(id);
    setCapsules((prev) => prev.filter((c) => c.id !== id));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: 80 }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Welcome, {user?.username}</h2>
        <button onClick={handleLogout}>Log out</button>
      </div>

      <CapsuleForm
        key={editing ? editing.id : 'new'}
        initial={editing}
        onSubmit={editing ? (data) => handleUpdate(editing.id, data) : handleCreate}
        onCancel={() => setEditing(null)}
      />

      <CapsuleList capsules={capsules} onEdit={setEditing} onDelete={handleDelete} />
    </div>
  );
}
