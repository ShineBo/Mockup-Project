import { useState } from 'react'
import Icon from '../icons'
import { Badge, FileIcon } from '../components/ui'

export default function AdminSharingPage({ records, onReview }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const visible = records
    .filter((record) =>
      `${record.file.name} ${record.owner} ${record.recipient} ${record.recipientEmail}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .filter((record) => status === 'All' || record.status === status)

  return (
    <section className="panel admin-records-panel">
      <div className="records-introduction">
        <div>
          <h2>
            Company sharing records <span>{records.length}</span>
          </h2>
          <p>Review who owns each shared item and who it was shared with.</p>
        </div>
        <Badge tone="neutral">Metadata only</Badge>
      </div>
      <div className="records-toolbar">
        <label className="search-box">
          <Icon name="search" size={18} />
          <input
            aria-label="Search sharing records"
            placeholder="Search file, owner, or recipient..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className="compact-filter">
          Record status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>All</option>
            <option>Active</option>
            <option>Needs review</option>
          </select>
        </label>
      </div>
      <div className="table-scroll">
        <table className="employee-table admin-records-table">
          <thead>
            <tr>
              <th>Shared item</th>
              <th>Owner</th>
              <th>Recipient</th>
              <th>Permission</th>
              <th>Review status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((record) => (
              <tr key={record.id}>
                <td>
                  <div className="record-item">
                    <FileIcon file={record.file} />
                    <span>
                      {record.file.name}
                      <small>
                        {record.file.type === 'folder'
                          ? 'Folder'
                          : `${record.file.type.toUpperCase()} file`}
                      </small>
                    </span>
                  </div>
                </td>
                <td>{record.owner}</td>
                <td>
                  {record.recipient}
                  <small>{record.recipientEmail}</small>
                </td>
                <td>
                  <Badge tone="neutral">{record.permission}</Badge>
                </td>
                <td>
                  <Badge tone={record.status === 'Active' ? '' : 'warning'}>
                    {record.status}
                  </Badge>
                </td>
                <td>
                  <button
                    className="text-action"
                    aria-label={`Review ${record.file.name} shared with ${record.recipient}`}
                    onClick={() => onReview(record)}
                  >
                    Review <Icon name="chevron" size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visible.length === 0 && (
        <div className="empty-state">
          <Icon name="search" size={28} />
          <h3>No sharing records found</h3>
          <p>Try another search or review status.</p>
        </div>
      )}
      <p className="admin-table-note">
        <Icon name="lock" size={14} />
        This view contains item metadata. File previews and downloads belong to
        the employee workspace.
      </p>
    </section>
  )
}
