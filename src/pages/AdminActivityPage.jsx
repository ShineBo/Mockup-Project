import { useState } from 'react'
import Icon from '../icons'
import { Badge } from '../components/ui'
import { formatRecordTime } from '../admin'

export default function AdminActivityPage({ records }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const visible = records
    .filter((record) =>
      `${record.actor} ${record.action} ${record.target} ${record.detail}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .filter((record) => category === 'All' || record.category === category)
  return (
    <section className="panel admin-records-panel">
      <div className="records-introduction">
        <div>
          <h2>
            Workspace activity <span>{records.length}</span>
          </h2>
          <p>
            Account changes and sharing updates made in this frontend preview.
          </p>
        </div>
        <Badge tone="neutral">Local records</Badge>
      </div>
      <div className="records-toolbar">
        <label className="search-box">
          <Icon name="search" size={18} />
          <input
            aria-label="Search activity records"
            placeholder="Search person, action, or item..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className="compact-filter">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option>All</option>
            <option>Account</option>
            <option>Sharing</option>
          </select>
        </label>
      </div>
      <div className="table-scroll">
        <table className="employee-table admin-records-table">
          <thead>
            <tr>
              <th>Time (Bangkok)</th>
              <th>Performed by</th>
              <th>Action</th>
              <th>Account / Item</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((record) => (
              <tr key={record.id}>
                <td>{formatRecordTime(record.time)}</td>
                <td>
                  {record.actor}
                  <small>{record.category}</small>
                </td>
                <td>{record.action}</td>
                <td>
                  <strong className="record-target">{record.target}</strong>
                  <small className="record-description">{record.detail}</small>
                </td>
                <td>
                  <Badge tone="neutral">
                    {record.sample ? 'Sample' : 'Local change'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visible.length === 0 && (
        <div className="empty-state">
          <Icon name="list" size={28} />
          <h3>No activity matches</h3>
          <p>Try another search or category.</p>
        </div>
      )}
      <p className="admin-table-note">
        <Icon name="info" size={14} />
        Latest 200 local entries. Sample rows are labeled. This is a demo
        history, not a protected audit system.
      </p>
    </section>
  )
}
