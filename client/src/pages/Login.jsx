export default function Login() {
  return (
    <div style={{ maxWidth: 480, margin: '100px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2>Sign in to AI Capsule</h2>
      {/* Full page navigation (not fetch) - this must hit GitHub's OAuth screen directly */}
      <a href="/api/auth/github">
        <button style={{ padding: '10px 20px', fontSize: 16 }}>Sign in with GitHub</button>
      </a>
    </div>
  );
}
