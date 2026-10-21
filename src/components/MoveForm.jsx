import { useState } from 'react'

export default function MoveForm({ file, folders, files, onSave, onCancel }) {
  const [parent, setParent] = useState(file.parent || ''),
    [error, setError] = useState('')
  const blocked = new Set([file.id])
  let changed = true
  while (changed) {
    changed = false
    files.forEach((f) => {
      if (blocked.has(f.parent) && !blocked.has(f.id)) {
        blocked.add(f.id)
        changed = true
      }
    })
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setError(onSave(parent || null) || '')
      }}
    >
      <p className="dialog-copy">
        Choose a destination for <strong>{file.name}</strong>.
      </p>
      <label>
        Destination
        <select value={parent} onChange={(e) => setParent(e.target.value)}>
          <option value="">My files (root)</option>
          {folders
            .filter((f) => !blocked.has(f.id))
            .map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
        </select>
      </label>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <div className="form-footer">
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn primary">Move here</button>
      </div>
    </form>
  )
}
