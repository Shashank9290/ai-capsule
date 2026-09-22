export default function CapsuleList({ capsules, onEdit, onDelete }) {
  if (!capsules.length) {
    return <p>No prompt records yet — add your first one above.</p>;
  }

  return (
    <div>
      {capsules.map((c) => (
        <div key={c.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{c.prompt_title}</strong>
            <span>{c.prompt_version}</span>
          </div>
          <p style={{ color: '#555' }}>
            {c.project_name} · {c.category} · {c.usefulness}
          </p>
          <p>{c.prompt_text}</p>
          {c.response_summary && <p><em>Response: {c.response_summary}</em></p>}
          {c.notes && <p>Notes: {c.notes}</p>}
          <p style={{ fontSize: 12, color: '#888' }}>
            Reviewed: {c.reviewed ? 'Yes' : 'No'} · Improved: {c.improved ? 'Yes' : 'No'} · {c.created_at}
          </p>
          <button onClick={() => onEdit(c)}>Edit</button>
          <button onClick={() => onDelete(c.id)} style={{ marginLeft: 8 }}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
