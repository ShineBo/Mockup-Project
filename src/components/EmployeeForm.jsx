import { useState } from 'react'

export default function EmployeeForm({
  employee,
  employees,
  currentUserId,
  onSave,
  onCancel,
}) {
  const [data, setData] = useState(
    employee || {
      name: '',
      email: '',
      company: 'Cloudspace',
      department: '',
      position: '',
      role: 'Employee',
      status: 'Active',
    },
  )
  const [error, setError] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (
          ['name', 'company', 'department', 'position'].some(
            (key) => !data[key].trim(),
          )
        ) {
          return setError(
            'Please complete all account details. Blank spaces are not valid values.',
          )
        }
        if (
          employee?.id === currentUserId &&
          (data.role !== 'Admin' || data.status !== 'Active')
        ) {
          return setError(
            'You cannot deactivate your current admin account or remove its admin role.',
          )
        }
        if (
          employee?.role === 'Admin' &&
          employee.status === 'Active' &&
          (data.role !== 'Admin' || data.status !== 'Active') &&
          !employees.some(
            (account) =>
              account.id !== employee.id &&
              account.role === 'Admin' &&
              account.status === 'Active',
          )
        ) {
          return setError(
            'Keep at least one active admin account in the workspace.',
          )
        }
        if (
          employees.some(
            (x) =>
              x.id !== employee?.id &&
              x.email.toLowerCase() === data.email.trim().toLowerCase(),
          )
        )
          return setError('An employee with this email already exists.')
        onSave({
          ...data,
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          company: data.company.trim(),
          department: data.department.trim(),
          position: data.position.trim(),
          id:
            employee?.id ||
            `EMP-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
        })
      }}
    >
      <div className="form-grid">
        {[
          ['name', 'Full name'],
          ['email', 'Email address'],
          ['company', 'Company'],
          ['department', 'Department'],
          ['position', 'Position'],
        ].map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              required
              value={data[key]}
              type={key === 'email' ? 'email' : 'text'}
              onChange={(e) => setData({ ...data, [key]: e.target.value })}
            />
          </label>
        ))}
        {!employee && (
          <label>
            Temporary password
            <input
              required
              minLength={8}
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
          </label>
        )}
        <label>
          Role
          <select
            disabled={employee?.id === currentUserId}
            value={data.role}
            onChange={(e) => setData({ ...data, role: e.target.value })}
          >
            <option>Employee</option>
            <option>Admin</option>
          </select>
        </label>
        <label>
          Account status
          <select
            disabled={employee?.id === currentUserId}
            value={data.status}
            onChange={(e) => setData({ ...data, status: e.target.value })}
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </label>
      </div>
      {employee?.id === currentUserId && (
        <p className="form-note">
          Your current admin account must remain active with the Admin role.
        </p>
      )}
      <p className="form-note">
        Demo account only. No email is sent and no password is saved.
      </p>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <div className="form-footer">
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn primary">
          {employee ? 'Save changes' : 'Create account'}
        </button>
      </div>
    </form>
  )
}
