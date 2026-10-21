import { useState } from 'react'
import Icon from '../icons'
import { Badge } from '../components/ui'

export default function EmployeesPage({
  employees,
  search,
  setSearch,
  setModal,
}) {
  const [status, setStatus] = useState('All')
  const [accountRole, setAccountRole] = useState('All')
  const filteredEmployees = employees
    .filter((employee) =>
      `${employee.name} ${employee.email} ${employee.department} ${employee.id}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .filter((employee) => status === 'All' || employee.status === status)
    .filter(
      (employee) => accountRole === 'All' || employee.role === accountRole,
    )
  return (
    <>
      <div className="employee-stats">
        {[
          [
            'Employee accounts',
            employees.filter((account) => account.role === 'Employee').length,
            'users',
          ],
          [
            'Active accounts',
            employees.filter((e) => e.status === 'Active').length,
            'check',
          ],
          [
            'Administrators',
            employees.filter((e) => e.role === 'Admin').length,
            'shield',
          ],
        ].map(([label, value, icon]) => (
          <div className="panel" key={label}>
            <span>
              <Icon name={icon} size={20} />
            </span>
            <div>
              <p>{label}</p>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </div>
      <div className="panel employee-panel">
        <div className="employee-toolbar">
          <h2>
            Account directory <span>{employees.length}</span>
          </h2>
          <label className="search-box">
            <Icon name="search" size={17} />
            <input
              aria-label="Search employees"
              placeholder="Search name, email or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        <div className="directory-filters">
          <label className="compact-filter">
            Account status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="All">All statuses</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>
          <label className="compact-filter">
            Role
            <select
              value={accountRole}
              onChange={(event) => setAccountRole(event.target.value)}
            >
              <option value="All">All roles</option>
              <option>Employee</option>
              <option>Admin</option>
            </select>
          </label>
          <span>
            {filteredEmployees.length} of {employees.length} accounts
          </span>
        </div>
        <div className="table-scroll">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department / Position</th>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div className="employee-name">
                      <span className="avatar small lavender">
                        {e.name
                          .split(' ')
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join('')}
                      </span>
                      <span>
                        <strong>{e.name}</strong>
                        <small>{e.email}</small>
                        <small>{e.id}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    {e.department}
                    <small>{e.position}</small>
                  </td>
                  <td>{e.company}</td>
                  <td>{e.role}</td>
                  <td>
                    <Badge tone={e.status === 'Active' ? '' : 'neutral'}>
                      <span className="status-dot" />
                      {e.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="account-edit-btn"
                      aria-label={`Edit ${e.name}`}
                      onClick={() =>
                        setModal({ type: 'employee', employee: e })
                      }
                    >
                      <Icon name="edit" size={15} /> Edit
                    </button>
                    <button
                      className="icon-btn"
                      aria-label={`View item records for ${e.name}`}
                      onClick={() =>
                        setModal({ type: 'employeeFiles', employee: e })
                      }
                    >
                      <Icon name="files" size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && (
            <div className="empty-state">
              <h3>No employees found</h3>
              <p>Try another name, email, or department.</p>
            </div>
          )}
        </div>
        <p className="admin-table-note">
          <Icon name="info" size={14} />
          Deactivate accounts to retain their records. Personal information is
          managed here; employees can only change their password.
        </p>
      </div>
    </>
  )
}
