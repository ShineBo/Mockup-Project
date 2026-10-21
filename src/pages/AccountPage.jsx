import { useState } from 'react'
import Icon from '../icons'
import { Badge } from '../components/ui'

const profileFields = [
  ['name', 'Full name'],
  ['email', 'Email address'],
  ['company', 'Company'],
  ['department', 'Department'],
  ['position', 'Position'],
  ['id', 'Employee ID'],
]

export default function AccountPage({
  profile,
  role,
  onPasswordChange,
  onSignOut,
}) {
  return (
    <div className="account-layout">
      <section className="panel profile-panel">
        <div className="profile-heading">
          <span className="avatar big">
            {profile.name
              .split(' ')
              .map((word) => word[0])
              .slice(0, 2)
              .join('')}
          </span>
          <div>
            <h2>{profile.name}</h2>
            <p>{profile.position}</p>
            <Badge>{role}</Badge>
          </div>
        </div>
        <h3>Personal information</h3>
        <p className="profile-note">
          Your administrator manages these details. Contact your admin if
          something needs updating.
        </p>
        <dl className="profile-details">
          {profileFields.map(([key, label]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>{profile[key] || '—'}</dd>
            </div>
          ))}
        </dl>
      </section>
      <div>
        <section className="panel password-panel">
          <h2>Change password</h2>
          <p>You can update your password here.</p>
          <PasswordForm onSave={onPasswordChange} />
        </section>
        <section className="panel session-panel">
          <Icon name="logout" size={22} />
          <div>
            <h3>Done for now?</h3>
            <p>Return to the sign-in screen.</p>
          </div>
          <button className="btn" onClick={onSignOut}>
            Sign out
          </button>
        </section>
      </div>
    </div>
  )
}

function PasswordForm({ onSave }) {
  const [error, setError] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const d = new FormData(e.currentTarget)
        if (d.get('new') !== d.get('confirm'))
          return setError('The new passwords do not match.')
        if (d.get('current') === d.get('new'))
          return setError('Choose a different new password.')
        setError('')
        e.currentTarget.reset()
        onSave()
      }}
    >
      <label>
        Current password
        <input
          name="current"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Enter current password"
        />
      </label>
      <div className="form-grid">
        <label>
          New password
          <input
            name="new"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
        </label>
        <label>
          Confirm new password
          <input
            name="confirm"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
            placeholder="Re-enter new password"
          />
        </label>
      </div>
      <p className="form-note">
        Preview only. Passwords are never stored or checked against a server.
      </p>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <button className="btn" type="submit">
        Change password
      </button>
    </form>
  )
}
