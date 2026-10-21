import Icon from '../icons'
import { Badge } from '../components/ui'
import { formatRecordTime } from '../admin'

export default function AdminOverviewPage({
  employees,
  sharingRecords,
  activity,
  onNavigate,
  onAddEmployee,
}) {
  const employeeAccounts = employees.filter(
    (account) => account.role === 'Employee',
  )
  const inactive = employeeAccounts.filter(
    (account) => account.status === 'Inactive',
  )
  const reviewCount = sharingRecords.filter(
    (record) => record.status === 'Needs review',
  ).length
  const stats = [
    ['Employee accounts', employeeAccounts.length, 'users', 'employees'],
    [
      'Active accounts',
      employees.filter((account) => account.status === 'Active').length,
      'check',
      'employees',
    ],
    ['Inactive employees', inactive.length, 'user', 'employees'],
    [
      'Shared items',
      new Set(sharingRecords.map((record) => record.file.id)).size,
      'link',
      'sharingRecords',
    ],
  ]

  return (
    <div className="admin-overview">
      <div className="admin-intro">
        <div className="admin-intro-icon">
          <Icon name="shield" size={30} />
        </div>
        <div>
          <Badge>ADMIN WORKSPACE</Badge>
          <h2>A clear view of your company workspace.</h2>
          <p>
            Manage people, review sharing, and keep track of account changes.
          </p>
        </div>
      </div>
      <div className="admin-stats">
        {stats.map(([label, value, icon, page]) => (
          <button
            className="panel admin-stat"
            key={label}
            onClick={() => onNavigate(page)}
          >
            <span className="stat-icon">
              <Icon name={icon} size={21} />
            </span>
            <span>
              <small>{label}</small>
              <strong>{value}</strong>
            </span>
            <Icon name="chevron" size={15} />
          </button>
        ))}
      </div>
      <div className="admin-overview-columns">
        <section className="panel admin-actions-panel">
          <h2>Quick actions</h2>
          <p>The everyday tasks, without the extra steps.</p>
          {[
            [
              'users',
              'Manage employee accounts',
              'Edit account details, departments, and status.',
              () => onNavigate('employees'),
            ],
            [
              'plus',
              'Register an employee',
              'Create an account for a new team member.',
              onAddEmployee,
            ],
            [
              'link',
              'Review sharing records',
              'See owners, recipients, and assigned permissions.',
              () => onNavigate('sharingRecords'),
            ],
          ].map(([icon, title, description, action]) => (
            <button className="admin-action" key={title} onClick={action}>
              <span>
                <Icon name={icon} size={20} />
              </span>
              <span>
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
              <Icon name="chevron" size={16} />
            </button>
          ))}
        </section>
        <section className="panel admin-review-panel">
          <div className="section-heading">
            <h2>At a glance</h2>
            <Icon name="info" size={18} />
          </div>
          <div className="review-summary">
            <strong>{inactive.length}</strong>
            <div>
              <h3>
                Inactive employee account{inactive.length === 1 ? '' : 's'}
              </h3>
              <p>Kept in the directory for account history.</p>
            </div>
          </div>
          {inactive.length > 0 && (
            <div className="inactive-names">
              {inactive.map((account) => (
                <Badge tone="neutral" key={account.id}>
                  {account.name}
                </Badge>
              ))}
            </div>
          )}
          <div className="review-note">
            <Icon name={reviewCount ? 'info' : 'check'} size={18} />
            <p>
              {reviewCount
                ? `${reviewCount} sharing record(s) involve an unavailable recipient. Review them before your next demo.`
                : 'Current sharing records reference active employee recipients.'}
            </p>
          </div>
          <button
            className="text-action"
            onClick={() => onNavigate('sharingRecords')}
          >
            Review records <Icon name="arrow" size={15} />
          </button>
        </section>
      </div>
      <section className="panel admin-recent-panel">
        <div className="section-heading">
          <h2>Recent activity</h2>
          <button
            className="text-action"
            onClick={() => onNavigate('activity')}
          >
            View all records <Icon name="arrow" size={15} />
          </button>
        </div>
        <p className="admin-record-note">
          Sample entries and changes made in this browser. Times shown in
          Bangkok time.
        </p>
        {activity.slice(0, 4).map((record) => (
          <div className="recent-record" key={record.id}>
            <span className="record-icon">
              <Icon
                name={record.category === 'Account' ? 'user' : 'link'}
                size={17}
              />
            </span>
            <div>
              <strong>{record.action}</strong>
              <p>
                {record.target} · {record.actor}
              </p>
            </div>
            <div>
              <small>{formatRecordTime(record.time)}</small>
              <Badge tone="neutral">{record.sample ? 'Sample' : 'Local'}</Badge>
            </div>
          </div>
        ))}
        {activity.length === 0 && (
          <p className="admin-record-note">Account changes will appear here.</p>
        )}
      </section>
    </div>
  )
}
