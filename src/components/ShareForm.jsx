import { useState } from 'react'
import Icon from '../icons'
import { Badge, FileIcon } from './ui'
import { formatSize } from '../data'

export default function ShareForm({
  file,
  employees,
  ownerEmail,
  onSave,
  onClose,
}) {
  const [access, setAccess] = useState(
      file.access === 'external' ? 'restricted' : file.access || 'restricted',
    ),
    [permission, setPermission] = useState('Read only'),
    [email, setEmail] = useState(''),
    [shares, setShares] = useState(file.shares || []),
    [link, setLink] = useState(file.link || ''),
    [error, setError] = useState(''),
    [copied, setCopied] = useState(false)
  function save() {
    if (access === 'internal') {
      if (!shares.length)
        return setError('Add an employee recipient or choose Restricted.')
      if (
        shares.some(
          (share) =>
            !employees.some(
              (employee) =>
                employee.role === 'Employee' &&
                employee.status === 'Active' &&
                employee.email.toLowerCase() === share.email.toLowerCase(),
            ),
        )
      ) {
        return setError(
          'Remove unavailable recipients before saving. Only active employee accounts can receive shares.',
        )
      }
    }
    onSave({
      access,
      shares: access === 'restricted' ? [] : shares,
      link: access === 'restricted' ? '' : link,
    })
    onClose()
  }
  return (
    <>
      <div className="share-file">
        <FileIcon file={file} />
        <div>
          <strong>{file.name}</strong>
          <small>
            {file.owner} · {formatSize(file.size)}
          </small>
        </div>
        <Icon name="shield" size={23} />
      </div>
      {file.access === 'external' && (
        <p className="form-note">
          This saved item used external sharing. Saving Restricted will remove
          its previous recipients.
        </p>
      )}
      <h3 className="form-section-title">General access</h3>
      <div className="access-options">
        {[
          [
            'restricted',
            'lock',
            'Restricted',
            'Only you can access this item.',
          ],
          [
            'internal',
            'users',
            'Within company',
            'Share with people in your company.',
          ],
          [
            'external',
            'link',
            'Across company',
            'Unavailable in the current two-role scope.',
          ],
        ].map(([value, icon, title, desc]) => (
          <label
            className={`${access === value ? 'chosen' : ''} ${value === 'external' ? 'unavailable' : ''}`}
            key={value}
          >
            <input
              type="radio"
              name="access"
              value={value}
              disabled={value === 'external'}
              checked={access === value}
              onChange={() => {
                setAccess(value)
                setError('')
                setLink('')
              }}
            />
            <Icon name={icon} size={18} />
            <span>
              <strong>{title}</strong>
              <small>{desc}</small>
            </span>
          </label>
        ))}
      </div>
      {access !== 'restricted' && (
        <>
          <h3 className="form-section-title">People with access</h3>
          <form
            className="add-recipient"
            onSubmit={(e) => {
              e.preventDefault()
              const clean = email.trim().toLowerCase()
              if (clean === ownerEmail.toLowerCase())
                return setError('You already own this item.')
              if (
                access === 'internal' &&
                !employees.some(
                  (e) =>
                    e.email.toLowerCase() === clean &&
                    e.status === 'Active' &&
                    e.role === 'Employee',
                )
              )
                return setError(
                  'Choose an active employee from the company directory.',
                )
              if (shares.some((s) => s.email === clean))
                return setError('This person already has access.')
              setShares((s) => [...s, { email: clean, permission }])
              setEmail('')
              setError('')
              setLink('')
            }}
          >
            <input
              type="email"
              required
              aria-label="Recipient email"
              placeholder={
                access === 'internal'
                  ? 'Employee email address'
                  : 'External email address'
              }
              value={email}
              list={access === 'internal' ? 'employees' : undefined}
              onChange={(e) => setEmail(e.target.value)}
            />
            <datalist id="employees">
              {employees
                .filter(
                  (e) =>
                    e.status === 'Active' &&
                    e.role === 'Employee' &&
                    e.email.toLowerCase() !== ownerEmail.toLowerCase(),
                )
                .map((e) => (
                  <option key={e.id} value={e.email}>
                    {e.name}
                  </option>
                ))}
            </datalist>
            <select
              aria-label="Recipient permission"
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
            >
              <option>Read only</option>
              <option>Read / Write</option>
            </select>
            <button className="btn" aria-label="Add recipient">
              <Icon name="plus" size={18} />
            </button>
          </form>
          <div className="recipient-list">
            {shares.map((s) => (
              <div key={s.email}>
                <span className="tiny-avatar lavender">
                  {s.email.slice(0, 1).toUpperCase()}
                </span>
                <span>{s.email}</span>
                <select
                  aria-label={`Permission for ${s.email}`}
                  value={s.permission}
                  onChange={(e) => {
                    setShares((prev) =>
                      prev.map((x) =>
                        x.email === s.email
                          ? { ...x, permission: e.target.value }
                          : x,
                      ),
                    )
                    setLink('')
                  }}
                >
                  <option>Read only</option>
                  <option>Read / Write</option>
                </select>
                <button
                  className="icon-btn"
                  aria-label={`Remove access for ${s.email}`}
                  onClick={() => {
                    setShares((prev) => prev.filter((x) => x.email !== s.email))
                    setLink('')
                  }}
                >
                  <Icon name="x" size={15} />
                </button>
              </div>
            ))}
          </div>
          <div className="link-box">
            <div>
              <Icon name="link" size={17} />
              <strong>Sharing link</strong>
              <Badge tone="neutral">Demo link</Badge>
            </div>
            {link ? (
              <div className="copy-link">
                <input
                  aria-label="Generated demo sharing link"
                  value={link}
                  readOnly
                />
                <button
                  className="btn"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(link)
                      setCopied(true)
                    } catch {
                      setError(
                        'Copy is unavailable. Select and copy the link manually.',
                      )
                    }
                  }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  if (!shares.length)
                    return setError(
                      'Add at least one recipient before generating a link.',
                    )
                  setLink(
                    `https://cloudspace.demo/share/${file.id}/${crypto.randomUUID().slice(0, 8)}`,
                  )
                  setError('')
                }}
              >
                Generate link <Icon name="arrow" size={16} />
              </button>
            )}
            <small>Links are simulated and will not open a hosted file.</small>
          </div>
        </>
      )}
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <div className="form-footer">
        <button className="btn" onClick={onClose}>
          Cancel
        </button>
        <button className="btn primary" onClick={save}>
          Save permissions
        </button>
      </div>
    </>
  )
}
