// Local projections for the admin mockup. These are not server audit records.
export const adminNavigation = [
  ['overview', 'Overview', 'grid'],
  ['employees', 'Employee accounts', 'users'],
  ['sharingRecords', 'Sharing records', 'link'],
  ['activity', 'Activity records', 'list'],
]

export const initialActivity = [
  {
    id: 'sample-account-1',
    actor: 'Daniel Kim',
    category: 'Account',
    action: 'Account created',
    target: 'Maya Chen',
    detail: 'Employee account added to the Design department.',
    time: '2026-10-19T09:15:00+07:00',
    sample: true,
  },
  {
    id: 'sample-account-2',
    actor: 'Daniel Kim',
    category: 'Account',
    action: 'Account deactivated',
    target: 'Olivia Wilson',
    detail: 'Account status changed from Active to Inactive.',
    time: '2026-10-18T15:30:00+07:00',
    sample: true,
  },
]

export function getItemOwner(file, employees, employeeProfile) {
  const ownerId =
    file.ownerId || (file.owner === 'You' ? employeeProfile.id : null)
  return employees.find((employee) =>
    ownerId ? employee.id === ownerId : employee.name === file.owner,
  )
}

export function getSharingRecords(files, employees, employeeProfile) {
  return files
    .filter((file) => !file.deleted)
    .flatMap((file) =>
      (file.received
        ? [{ email: employeeProfile.email, permission: file.permission }]
        : file.shares || []
      ).map((share) => {
        const owner = getItemOwner(file, employees, employeeProfile)
        const recipient = employees.find(
          (employee) =>
            employee.email.toLowerCase() === share.email.toLowerCase(),
        )
        return {
          id: `${file.id}:${share.email}`,
          file,
          owner: owner?.name || file.owner,
          recipient: recipient?.name || share.email,
          recipientEmail: share.email,
          permission: share.permission,
          status:
            !recipient ||
            recipient.status !== 'Active' ||
            recipient.role !== 'Employee' ||
            !owner ||
            owner.status !== 'Active'
              ? 'Needs review'
              : 'Active',
        }
      }),
    )
}

export function formatRecordTime(value) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value))
}

export const adminHelp = [
  [
    'grid',
    'Overview',
    'Start with account summaries, inactive employees, and recent changes.',
  ],
  [
    'users',
    'Employee accounts',
    'Register accounts, edit personal information, and filter by role or status.',
  ],
  [
    'link',
    'Sharing records',
    'Review item owners, recipients, and permissions without opening employee files.',
  ],
  [
    'list',
    'Activity records',
    'Search local account and sharing changes. Sample entries are labeled separately.',
  ],
]
