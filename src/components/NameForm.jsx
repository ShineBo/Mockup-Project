import { useState } from 'react'

export default function NameForm({ defaultValue, label, onSave, onCancel }) {
  const [name, setName] = useState(defaultValue),
    [error, setError] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!name.trim()) return setError('Please enter a name.')
        if (/[\\/]/.test(name))
          return setError('Names cannot include / or \\ characters.')
        setError(onSave(name.trim()) || '')
      }}
    >
      <label>
        {label}
        <input
          autoFocus
          value={name}
          maxLength={120}
          required
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Semester project"
        />
      </label>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <div className="form-footer">
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn primary">Save</button>
      </div>
    </form>
  )
}
