import { useState } from 'react';

const empty = {
  project_name: '', prompt_title: '', prompt_version: '', prompt_text: '',
  response_summary: '', category: '', usefulness: '', reviewed: false,
  improved: false, screenshot_url: '', notes: ''
};

export default function CapsuleForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial ? { ...empty, ...initial } : empty);

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
    if (!initial) setForm(empty);
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: 16, margin: '20px 0', borderRadius: 8 }}>
      <h3>{initial ? 'Edit prompt record' : 'New prompt record'}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <input placeholder="Project name" value={form.project_name} onChange={update('project_name')} required />
        <input placeholder="Prompt title" value={form.prompt_title} onChange={update('prompt_title')} required />
        <input placeholder="Version (v1, v2...)" value={form.prompt_version} onChange={update('prompt_version')} />
        <input placeholder="Category" value={form.category} onChange={update('category')} />
        <input placeholder="Usefulness (Good / Needs Improvement)" value={form.usefulness} onChange={update('usefulness')} />
        <input placeholder="Screenshot URL" value={form.screenshot_url} onChange={update('screenshot_url')} />
      </div>
      <textarea
        placeholder="Prompt text"
        value={form.prompt_text}
        onChange={update('prompt_text')}
        required
        style={{ width: '100%', marginTop: 8 }}
        rows={3}
      />
      <textarea
        placeholder="Response summary"
        value={form.response_summary}
        onChange={update('response_summary')}
        style={{ width: '100%', marginTop: 8 }}
        rows={2}
      />
      <textarea
        placeholder="Notes"
        value={form.notes}
        onChange={update('notes')}
        style={{ width: '100%', marginTop: 8 }}
        rows={2}
      />
      <div style={{ marginTop: 8 }}>
        <label style={{ marginRight: 16 }}>
          <input type="checkbox" checked={form.reviewed} onChange={update('reviewed')} /> Reviewed
        </label>
        <label>
          <input type="checkbox" checked={form.improved} onChange={update('improved')} /> Improved
        </label>
      </div>
      <div style={{ marginTop: 12 }}>
        <button type="submit">{initial ? 'Save changes' : 'Add record'}</button>
        {initial && (
          <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
