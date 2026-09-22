import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ maxWidth: 640, margin: '80px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>AI Capsule</h1>
      <p>
        Save, review and improve the AI prompts you actually use — for coding,
        writing, debugging and study.
      </p>
      <p>Sign in to create your own private prompt library.</p>
      <Link to="/login">
        <button style={{ padding: '10px 20px', fontSize: 16 }}>Get started</button>
      </Link>
    </div>
  );
}
