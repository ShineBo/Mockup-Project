import { useEffect, useRef, useState } from 'react'
import Icon from './icons'
import { initialFiles, initialEmployees, formatSize, today } from './data'
import { Badge, FileIcon, Modal, Logo } from './components/ui'
import NameForm from './components/NameForm'
import ShareForm from './components/ShareForm'
import MoveForm from './components/MoveForm'
import EmployeeForm from './components/EmployeeForm'
import { ImagePreview, TextPreview } from './components/FilePreview'
import AccountPage from './pages/AccountPage'
import UploadPage from './pages/UploadPage'
import EmployeesPage from './pages/EmployeesPage'
import LoginPage from './pages/LoginPage'
import AdminOverviewPage from './pages/AdminOverviewPage'
import AdminSharingPage from './pages/AdminSharingPage'
import AdminActivityPage from './pages/AdminActivityPage'
import {
  adminNavigation,
  adminHelp,
  initialActivity,
  getItemOwner,
  getSharingRecords,
} from './admin'
import './App.css'
const STORE = 'cloudspace-mockup-v1'
function readStore() {
  try {
    return JSON.parse(localStorage.getItem(STORE)) || {}
  } catch {
    return {}
  }
}
const saved = readStore()
const initialRole = saved.demoRole === 'Admin' ? 'Admin' : 'Employee'
const navItems = [
  ['files', 'My files', 'folder'],
  ['shared', 'Shared with me', 'users'],
  ['links', 'Shared by me', 'link'],
  ['upload', 'Upload files', 'upload'],
  ['trash', 'Trash', 'trash'],
]
export default function App() {
  const [files, setFiles] = useState(() =>
    (saved.files || initialFiles).map((file) => ({
      ...file,
      ownerId:
        file.ownerId ||
        getItemOwner(
          file,
          saved.employees || initialEmployees,
          saved.profile || initialEmployees[0],
        )?.id,
    })),
  )
  const [employees, setEmployees] = useState(
    saved.employees || initialEmployees,
  )
  const [profile, setProfile] = useState(saved.profile || initialEmployees[0])
  const [activity, setActivity] = useState(saved.activity || initialActivity)
  const [page, setPage] = useState(
    initialRole === 'Admin' ? 'overview' : 'files',
  )
  const [folder, setFolder] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('modified')
  const [view, setView] = useState('list')
  const [selected, setSelected] = useState([])
  const [detail, setDetail] = useState(null)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const [role, setRole] = useState(initialRole)
  const [signedIn, setSignedIn] = useState(true)
  const [mobile, setMobile] = useState(false)
  const [queue, setQueue] = useState([])
  const [uploadFolder, setUploadFolder] = useState('')
  const [uploadError, setUploadError] = useState('')
  const blobs = useRef({})
  useEffect(() => {
    try {
      localStorage.setItem(
        STORE,
        JSON.stringify({ files, employees, profile, activity, demoRole: role }),
      )
    } catch {
      setToast(
        'Browser storage is full. Your current changes are available until you refresh.',
      )
    }
  }, [files, employees, profile, activity, role])
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 4200)
      return () => clearTimeout(t)
    }
  }, [toast])
  const isAdmin = role === 'Admin'
  const adminAccount =
    employees.find((employee) => employee.id === 'EMP-004') ||
    initialEmployees[3]
  const currentUser = isAdmin ? adminAccount : profile
  const sharingRecords = getSharingRecords(files, employees, profile)
  const notify = (message) => setToast(message)
  function recordActivity(category, action, target, detail) {
    const entry = {
      id: crypto.randomUUID(),
      actor: currentUser.name,
      category,
      action,
      target,
      detail,
      time: new Date().toISOString(),
    }
    setActivity((records) => [entry, ...records].slice(0, 200))
  }
  const navigate = (p) => {
    const allowedPages = isAdmin
      ? adminNavigation.map(([id]) => id)
      : navItems.map(([id]) => id)
    setPage(
      p === 'account' || allowedPages.includes(p)
        ? p
        : isAdmin
          ? 'overview'
          : 'files',
    )
    setModal(null)
    setFolder(null)
    setSearch('')
    setSelected([])
    setDetail(null)
    setFilter('all')
    setMobile(false)
    window.scrollTo({ top: 0, left: 0 })
  }
  function changeRole(nextRole) {
    setRole(nextRole)
    setPage(nextRole === 'Admin' ? 'overview' : 'files')
    setFolder(null)
    setSearch('')
    setSelected([])
    setDetail(null)
    setModal(null)
    setFilter('all')
    setMobile(false)
    window.scrollTo({ top: 0, left: 0 })
  }
  const activeFiles = files.filter((f) => !f.deleted && !f.received)
  const folders = activeFiles.filter((f) => f.type === 'folder')
  const current = files.find((f) => f.id === folder)
  const detailFile = files.find((f) => f.id === detail)
  const list = files
    .filter((f) => {
      if (page === 'trash') return f.deleted
      if (f.deleted) return false
      if (page === 'shared') return f.received && f.parent === folder
      if (page === 'links') return !f.received && f.shares?.length
      return !f.received && f.parent === folder
    })
    .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    .filter(
      (f) =>
        filter === 'all' ||
        (filter === 'folders'
          ? f.type === 'folder'
          : filter === 'images'
            ? ['jpg', 'png', 'jpeg', 'webp'].includes(f.type)
            : f.type !== 'folder' &&
              !['jpg', 'png', 'jpeg', 'webp'].includes(f.type)),
    )
    .sort((a, b) =>
      sort === 'name'
        ? a.name.localeCompare(b.name)
        : b.modified.localeCompare(a.modified),
    )
  const visibleFolders = list.filter((f) => f.type === 'folder')
  const visibleFiles = list.filter((f) => f.type !== 'folder')
  const update = (id, data) =>
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)))
  const canManage = (f) => !f.received || f.permission === 'Read / Write'
  const openFile = (f) => {
    if (f.type === 'folder') {
      setFolder(f.id)
      setSelected([])
    } else setModal({ type: 'preview', file: f })
  }
  function trashItems(ids) {
    const all = new Set(ids)
    let changed = true
    while (changed) {
      changed = false
      files.forEach((f) => {
        if (all.has(f.parent) && !all.has(f.id)) {
          all.add(f.id)
          changed = true
        }
      })
    }
    setFiles((prev) =>
      prev.map((f) => (all.has(f.id) ? { ...f, deleted: true } : f)),
    )
    setSelected([])
    setDetail(null)
    setModal(null)
    notify(`${ids.length === 1 ? 'Item' : 'Items'} moved to Trash`)
  }
  function restoreItems(ids) {
    const all = new Set(ids)
    ids.forEach((id) => {
      let item = files.find((f) => f.id === id)
      while (item?.parent) {
        all.add(item.parent)
        item = files.find((f) => f.id === item.parent)
      }
    })
    let changed = true
    while (changed) {
      changed = false
      files.forEach((f) => {
        if (all.has(f.parent) && !all.has(f.id)) {
          all.add(f.id)
          changed = true
        }
      })
    }
    setFiles((prev) =>
      prev.map((f) => (all.has(f.id) ? { ...f, deleted: false } : f)),
    )
    setSelected([])
    notify('Items restored to their original folders')
  }
  function download(f) {
    if (f.type === 'folder') return
    if (f.uploaded && !blobs.current[f.id])
      return notify('Upload this file again to download its original contents.')
    const actual = blobs.current[f.id]
    const text =
      f.content ||
      `Cloudspace demonstration file\n\nName: ${f.name}\nOwner: ${f.owner}\n\nThis is a sample file in a frontend mockup. Upload a real file to download its original contents during this session.`
    const url = URL.createObjectURL(
      actual || new Blob([text], { type: 'text/plain' }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = actual ? f.name : `${f.name}.demo.txt`
    a.click()
    URL.revokeObjectURL(url)
    notify(
      actual ? 'Download started' : 'Sample downloaded as a demo text file',
    )
  }
  function addQueue(incoming) {
    const accepted = []
    let rejected = 0
    Array.from(incoming).forEach((f) => {
      if (f.size > 25 * 1024 * 1024) {
        rejected++
        return
      }
      accepted.push({ id: crypto.randomUUID(), file: f, name: f.name })
    })
    setQueue((q) => [...q, ...accepted])
    setUploadError(
      rejected
        ? `${rejected} file(s) exceed the 25 MB mockup limit. Please select smaller files.`
        : '',
    )
  }
  function upload() {
    if (!queue.length) return
    if (
      activeFiles.reduce((n, f) => n + (f.size || 0), 0) +
        queue.reduce((n, q) => n + q.file.size, 0) >
      1073741824
    ) {
      setUploadError(
        'Your workspace would exceed its 1 GB demo capacity. Remove files or choose fewer files.',
      )
      return
    }
    const newFiles = queue.map((q) => {
      blobs.current[q.id] = q.file
      return {
        id: q.id,
        name: q.name.trim(),
        type: q.name.split('.').pop().toLowerCase(),
        size: q.file.size,
        parent: uploadFolder || null,
        modified: today(),
        owner: 'You',
        ownerId: profile.id,
        uploaded: true,
      }
    })
    setFiles((f) => [...newFiles, ...f])
    setQueue([])
    navigate('files')
    setFolder(uploadFolder || null)
    notify(`${newFiles.length} file${newFiles.length > 1 ? 's' : ''} uploaded`)
  }
  const headings = {
    files: ['My files', 'A little more organized. A lot more possible.'],
    shared: [
      'Shared with me',
      'The files and folders your team has shared with you.',
    ],
    links: [
      'Shared by me',
      'Your shared files, links, and the people who can access them.',
    ],
    upload: ['Upload files', 'Give your work a place to call home.'],
    trash: [
      'Trash',
      'Restore deleted files and folders whenever you need them.',
    ],
    employees: [
      'Employee accounts',
      'A simple place to manage your company’s accounts.',
    ],
    account: ['My account', 'Your account details and password.'],
    overview: [
      'Admin overview',
      'Manage your workspace. Keep your team moving.',
    ],
    sharingRecords: [
      'Sharing records',
      'A clear view of shared items and assigned access.',
    ],
    activity: [
      'Activity records',
      'Review recent account and sharing changes.',
    ],
  }
  function renderRow(f) {
    return (
      <tr key={f.id} className={selected.includes(f.id) ? 'selected' : ''}>
        <td>
          <input
            aria-label={`Select ${f.name}`}
            type="checkbox"
            checked={selected.includes(f.id)}
            onChange={(e) =>
              setSelected((s) =>
                e.target.checked ? [...s, f.id] : s.filter((id) => id !== f.id),
              )
            }
          />
        </td>
        <td>
          <button className="file-name" onClick={() => openFile(f)}>
            <FileIcon file={f} />
            <span>
              {f.name}
              <small>
                {f.type === 'folder'
                  ? 'Folder'
                  : `${f.type.toUpperCase()} file`}
              </small>
            </span>
          </button>
        </td>
        <td>
          <span className="owner">
            <span
              className={`tiny-avatar ${f.owner === 'You' ? '' : 'lavender'}`}
            >
              {f.owner === 'You'
                ? 'SB'
                : f.owner
                    .split(' ')
                    .map((w) => w[0])
                    .join('')}
            </span>
            {f.owner}
          </span>
        </td>
        <td>
          {new Date(`${f.modified}T12:00:00`).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </td>
        <td>{formatSize(f.size)}</td>
        <td>
          {f.received ? (
            <Badge tone="neutral">{f.permission}</Badge>
          ) : f.shares?.length ? (
            <span className="shared-indicator">
              <Icon name="users" size={15} />
              {f.shares.length} {f.shares.length === 1 ? 'person' : 'people'}
            </span>
          ) : (
            <span className="private-label">
              <Icon name="lock" size={13} /> Only you
            </span>
          )}
        </td>
        <td>
          <div className="row-actions">
            {page === 'trash' ? (
              <button
                className="icon-btn"
                title="Restore"
                aria-label={`Restore ${f.name}`}
                onClick={() => restoreItems([f.id])}
              >
                <Icon name="restore" size={17} />
              </button>
            ) : (
              <>
                {!f.received && (
                  <button
                    className="icon-btn"
                    title="Share"
                    aria-label={`Share ${f.name}`}
                    onClick={() => setModal({ type: 'share', file: f })}
                  >
                    <Icon name="share" size={16} />
                  </button>
                )}
                {f.type !== 'folder' && (
                  <button
                    className="icon-btn"
                    title="Download"
                    aria-label={`Download ${f.name}`}
                    onClick={() => download(f)}
                  >
                    <Icon name="download" size={16} />
                  </button>
                )}
                <button
                  className={`icon-btn ${detail === f.id ? 'active' : ''}`}
                  title="File details"
                  aria-label={`Details for ${f.name}`}
                  onClick={() => setDetail(detail === f.id ? null : f.id)}
                >
                  <Icon name="info" size={17} />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    )
  }
  if (!signedIn)
    return (
      <LoginPage
        role={role}
        setRole={changeRole}
        onSignIn={(showWelcome) => {
          setSignedIn(true)
          navigate(isAdmin ? 'overview' : 'files')
          if (showWelcome)
            notify(`Welcome back, ${currentUser.name.split(' ')[0]}`)
        }}
      />
    )
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? 'mobile-open' : ''}`}>
        <Logo />
        <div className="workspace">
          <span className="workspace-icon">C</span>
          <div>
            <strong>
              {isAdmin ? 'Administration' : 'Cloudspace workspace'}
            </strong>
            <small>
              {isAdmin ? 'Company management' : 'Company workspace'}
            </small>
          </div>
          <Icon name="down" size={14} />
        </div>
        <span className="nav-label">
          {isAdmin ? 'ADMINISTRATION' : 'WORKSPACE'}
        </span>
        <nav>
          {(isAdmin ? adminNavigation : navItems).map(([id, label, icon]) => (
            <button
              key={id}
              className={`nav-item ${page === id ? 'active' : ''}`}
              onClick={() => navigate(id)}
            >
              <Icon name={icon} size={19} />
              {label}
              {id === 'shared' && (
                <span className="nav-count">
                  {files.filter((f) => f.received && !f.deleted).length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="nav-separator" />
        <span className="nav-label">ACCOUNT</span>
        <nav>
          <button
            className={`nav-item ${page === 'account' ? 'active' : ''}`}
            onClick={() => navigate('account')}
          >
            <Icon name="user" size={19} />
            My account
          </button>
        </nav>
        <div className="sidebar-bottom">
          {isAdmin ? (
            <div className="admin-sidebar-note">
              <Icon name="shield" size={20} />
              <strong>People & workspace</strong>
              <p>Manage accounts and review records from one place.</p>
              <Badge tone="neutral">Admin view</Badge>
            </div>
          ) : (
            <div className="storage-box">
              <div>
                <Icon name="cloud" size={19} />
                <strong>Your storage</strong>
                <span>
                  {Math.round(
                    (activeFiles.reduce((n, f) => n + (f.size || 0), 0) /
                      1073741824) *
                      100,
                  )}
                  %
                </span>
              </div>
              <div className="storage-meter">
                <span
                  style={{
                    width: `${Math.max(2, (activeFiles.reduce((n, f) => n + (f.size || 0), 0) / 1073741824) * 100)}%`,
                  }}
                />
              </div>
              <p>
                {formatSize(activeFiles.reduce((n, f) => n + (f.size || 0), 0))}{' '}
                <span>of 1 GB used</span>
              </p>
            </div>
          )}
          <button
            className="help-link"
            onClick={() => setModal({ type: 'help' })}
          >
            <Icon name="help" size={18} />A little help?
            <Icon name="arrow" size={16} />
          </button>
          <button
            className="sidebar-profile"
            onClick={() => navigate('account')}
          >
            <span className="avatar">
              {currentUser.name
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')}
            </span>
            <span>
              <strong>{currentUser.name}</strong>
              <small>{role} account</small>
            </span>
            <Icon name="chevron" size={16} />
          </button>
        </div>
      </aside>
      {mobile && (
        <button
          className="sidebar-shade"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-btn mobile-toggle"
            aria-label="Open navigation"
            onClick={() => setMobile(!mobile)}
          >
            <Icon name="menu" />
          </button>
          <div className="top-breadcrumb">
            {isAdmin ? 'Administration' : 'Workspace'}
            <Icon name="chevron" size={13} />
            <strong>{headings[page][0]}</strong>
          </div>
          <div className="topbar-right">
            <span className="demo-label">
              <span />
              Frontend preview
            </span>
            <label className="role-select">
              <Icon name="shield" size={14} />
              <select
                aria-label="Demo role"
                value={role}
                onChange={(e) => {
                  changeRole(e.target.value)
                  notify(`Switched to ${e.target.value.toLowerCase()} view`)
                }}
              >
                <option>Employee</option>
                <option>Admin</option>
              </select>
            </label>
            <button
              className="avatar small"
              aria-label="Open my account"
              onClick={() => navigate('account')}
            >
              {currentUser.name
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')}
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {isAdmin
                  ? 'YOUR WORKSPACE, IN GOOD HANDS'
                  : 'YOUR WORK, TOGETHER'}
              </div>
              <h1>
                {headings[page][0]}
                <span className="heading-dot">.</span>
              </h1>
              <p>{headings[page][1]}</p>
            </div>
            <div className="heading-actions">
              {page === 'files' && (
                <>
                  <button
                    className="btn"
                    onClick={() => setModal({ type: 'folder' })}
                  >
                    <Icon name="plus" size={17} />
                    New folder
                  </button>
                  <button
                    className="btn primary"
                    onClick={() => {
                      setUploadFolder(folder || '')
                      navigate('upload')
                    }}
                  >
                    <Icon name="upload" size={17} />
                    Upload files
                  </button>
                </>
              )}
              {isAdmin && ['overview', 'employees'].includes(page) && (
                <button
                  className="btn primary"
                  onClick={() => setModal({ type: 'employee' })}
                >
                  <Icon name="plus" size={18} />
                  Add employee
                </button>
              )}
            </div>
          </div>
          {isAdmin && page === 'overview' && (
            <AdminOverviewPage
              employees={employees}
              sharingRecords={sharingRecords}
              activity={activity}
              onNavigate={navigate}
              onAddEmployee={() => setModal({ type: 'employee' })}
            />
          )}
          {isAdmin && page === 'sharingRecords' && (
            <AdminSharingPage
              records={sharingRecords}
              onReview={(record) => setModal({ type: 'shareRecord', record })}
            />
          )}
          {isAdmin && page === 'activity' && (
            <AdminActivityPage records={activity} />
          )}
          {!isAdmin && ['files', 'shared', 'links', 'trash'].includes(page) && (
            <>
              {page === 'files' && !folder && !search && (
                <div className="welcome-banner">
                  <div className="banner-icon">
                    <Icon name="cloud" size={33} />
                  </div>
                  <div>
                    <h3>A home for everything you’re working on.</h3>
                    <p>Upload, organize, and share. Keep good work moving.</p>
                  </div>
                  <span className="banner-decoration">
                    <Icon name="folder" size={64} />
                    <Icon name="file" size={41} />
                  </span>
                  <Badge>
                    <Icon name="shield" size={13} />
                    Your workspace, organized
                  </Badge>
                </div>
              )}
              <div className="file-controls">
                <label className="search-box">
                  <Icon name="search" size={18} />
                  <input
                    aria-label="Search files and folders"
                    placeholder="Search files and folders..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      aria-label="Clear search"
                      onClick={() => setSearch('')}
                    >
                      <Icon name="x" size={15} />
                    </button>
                  )}
                </label>
                <div className="control-right">
                  <label className="sort-control">
                    Sort by:
                    <select
                      aria-label="Sort files"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="modified">Last modified</option>
                      <option value="name">Name A–Z</option>
                    </select>
                  </label>
                  <div className="view-toggle">
                    <button
                      className={view === 'list' ? 'active' : ''}
                      aria-label="List view"
                      aria-pressed={view === 'list'}
                      onClick={() => setView('list')}
                    >
                      <Icon name="list" size={18} />
                    </button>
                    <button
                      className={view === 'grid' ? 'active' : ''}
                      aria-label="Grid view"
                      aria-pressed={view === 'grid'}
                      onClick={() => setView('grid')}
                    >
                      <Icon name="grid" size={17} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="filter-row">
                <div className="filter-tabs">
                  {[
                    ['all', 'All items'],
                    ['folders', 'Folders'],
                    ['documents', 'Documents'],
                    ['images', 'Images'],
                  ].map(([id, text]) => (
                    <button
                      className={filter === id ? 'active' : ''}
                      key={id}
                      onClick={() => {
                        setFilter(id)
                        setSelected([])
                      }}
                    >
                      {text}
                    </button>
                  ))}
                </div>
                <span>{list.length} items</span>
              </div>
              {folder && (
                <div className="folder-breadcrumb">
                  <button onClick={() => setFolder(null)}>
                    {page === 'shared' ? 'Shared with me' : 'My files'}
                  </button>
                  <Icon name="chevron" size={14} />
                  {current?.parent && (
                    <>
                      <button onClick={() => setFolder(current.parent)}>
                        {files.find((f) => f.id === current.parent)?.name}
                      </button>
                      <Icon name="chevron" size={14} />
                    </>
                  )}
                  <strong>{current?.name}</strong>
                </div>
              )}
              {page === 'trash' && (
                <div className="info-strip">
                  <Icon name="info" size={17} />
                  Deleted items stay here until you restore or permanently
                  delete them. <span>Demo data only.</span>
                </div>
              )}
              <div
                className={`files-and-detail ${detailFile ? 'has-detail' : ''}`}
              >
                <div className="file-content">
                  {visibleFolders.length > 0 && page === 'files' && (
                    <section className="folders-section">
                      <div className="section-heading">
                        <h2>
                          {folder ? 'Folders' : 'Your folders'}{' '}
                          <span>{visibleFolders.length}</span>
                        </h2>
                        <span>Everything in its right place</span>
                      </div>
                      <div className="folder-grid">
                        {visibleFolders.map((f) => (
                          <div
                            className={`folder-card ${f.color || 'teal'}`}
                            key={f.id}
                          >
                            <div className="folder-card-top">
                              <button
                                className="folder-open-icon"
                                aria-label={`Open ${f.name}`}
                                onClick={() => openFile(f)}
                              >
                                <FileIcon file={f} large />
                              </button>
                              <button
                                className="icon-btn"
                                aria-label={`Details for ${f.name}`}
                                onClick={() =>
                                  setDetail(detail === f.id ? null : f.id)
                                }
                              >
                                <Icon name="more" size={19} />
                              </button>
                            </div>
                            <button
                              className="folder-title"
                              onClick={() => openFile(f)}
                            >
                              {f.name}
                            </button>
                            <div className="folder-card-bottom">
                              <span>
                                {
                                  files.filter(
                                    (x) => x.parent === f.id && !x.deleted,
                                  ).length
                                }{' '}
                                {files.filter(
                                  (x) => x.parent === f.id && !x.deleted,
                                ).length === 1
                                  ? 'item'
                                  : 'items'}
                              </span>
                              {f.shares?.length ? (
                                <span className="shared-indicator">
                                  <Icon name="users" size={14} />
                                  Shared
                                </span>
                              ) : (
                                <Icon name="lock" size={13} />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                  <section className="file-section">
                    <div className="section-heading">
                      <h2>
                        {page === 'files' ? 'Files' : headings[page][0]}{' '}
                        <span>
                          {page === 'files' ? visibleFiles.length : list.length}
                        </span>
                      </h2>
                      {selected.length ? (
                        <div className="selection-actions">
                          <span>{selected.length} selected</span>
                          {page === 'trash' ? (
                            <>
                              <button onClick={() => restoreItems(selected)}>
                                Restore
                              </button>
                              <button
                                className="danger-text"
                                onClick={() =>
                                  setModal({
                                    type: 'delete',
                                    ids: selected,
                                    permanent: true,
                                  })
                                }
                              >
                                Delete forever
                              </button>
                            </>
                          ) : (
                            page !== 'shared' && (
                              <button
                                onClick={() =>
                                  setModal({ type: 'delete', ids: selected })
                                }
                              >
                                Move to trash
                              </button>
                            )
                          )}
                        </div>
                      ) : (
                        <span>
                          {page === 'files'
                            ? 'Your most important work, all here.'
                            : 'Keep your workspace connected.'}
                        </span>
                      )}
                    </div>
                    {(page === 'files' ? visibleFiles : list).length === 0 ? (
                      <div className="empty-state">
                        <span>
                          <Icon
                            name={
                              page === 'trash'
                                ? 'trash'
                                : search
                                  ? 'search'
                                  : 'folder'
                            }
                            size={32}
                          />
                        </span>
                        <h3>
                          {search
                            ? 'No matching items'
                            : page === 'trash'
                              ? 'Your trash is empty'
                              : 'A little space for something new'}
                        </h3>
                        <p>
                          {search
                            ? 'Try another name or change the file type filter.'
                            : page === 'shared'
                              ? 'Files shared with you will appear here.'
                              : page === 'links'
                                ? 'Share a file from My files to see it here.'
                                : page === 'trash'
                                  ? 'Deleted files will appear here for recovery.'
                                  : 'Upload a file or create a folder to get started.'}
                        </p>
                        {page === 'files' && !search && (
                          <button
                            className="btn"
                            onClick={() => navigate('upload')}
                          >
                            <Icon name="upload" size={16} />
                            Upload files
                          </button>
                        )}
                      </div>
                    ) : view === 'list' ? (
                      <div className="table-scroll">
                        <table className="file-table">
                          <thead>
                            <tr>
                              <th>
                                <input
                                  type="checkbox"
                                  aria-label="Select all visible items"
                                  checked={
                                    (page === 'files' ? visibleFiles : list)
                                      .length > 0 &&
                                    (page === 'files'
                                      ? visibleFiles
                                      : list
                                    ).every((f) => selected.includes(f.id))
                                  }
                                  onChange={(e) =>
                                    setSelected(
                                      e.target.checked
                                        ? (page === 'files'
                                            ? visibleFiles
                                            : list
                                          ).map((f) => f.id)
                                        : [],
                                    )
                                  }
                                />
                              </th>
                              <th>Name</th>
                              <th>Owner</th>
                              <th>
                                Last modified <span>↓</span>
                              </th>
                              <th>File size</th>
                              <th>Access</th>
                              <th>
                                <span className="sr-only">Actions</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(page === 'files' ? visibleFiles : list).map(
                              renderRow,
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="file-grid">
                        {(page === 'files' ? visibleFiles : list).map((f) => (
                          <article key={f.id} className="file-grid-card">
                            <div>
                              <input
                                type="checkbox"
                                aria-label={`Select ${f.name}`}
                                checked={selected.includes(f.id)}
                                onChange={(e) =>
                                  setSelected((s) =>
                                    e.target.checked
                                      ? [...s, f.id]
                                      : s.filter((id) => id !== f.id),
                                  )
                                }
                              />
                              <button
                                className="icon-btn"
                                aria-label={`Details for ${f.name}`}
                                onClick={() => setDetail(f.id)}
                              >
                                <Icon name="info" size={17} />
                              </button>
                            </div>
                            <button
                              className="grid-file-open"
                              onClick={() => openFile(f)}
                            >
                              <FileIcon file={f} large />
                              <strong>{f.name}</strong>
                              <small>
                                {formatSize(f.size)} · {f.owner}
                              </small>
                            </button>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                  <div className="table-footer">
                    <span>
                      <Icon name="lock" size={13} />
                      Your files stay in your workspace.
                    </span>
                    <span>
                      {list.length} items ·{' '}
                      {formatSize(list.reduce((n, f) => n + (f.size || 0), 0))}
                    </span>
                  </div>
                </div>
                {detailFile && (
                  <aside className="details-panel">
                    <div className="section-heading">
                      <h2>Item details</h2>
                      <button
                        className="icon-btn"
                        aria-label="Close details"
                        onClick={() => setDetail(null)}
                      >
                        <Icon name="x" size={17} />
                      </button>
                    </div>
                    <div className="detail-preview">
                      <FileIcon file={detailFile} large />
                    </div>
                    <h3>{detailFile.name}</h3>
                    <Badge tone="neutral">
                      {detailFile.type === 'folder'
                        ? 'Folder'
                        : `${detailFile.type.toUpperCase()} file`}
                    </Badge>
                    <dl>
                      <dt>Owner</dt>
                      <dd>{detailFile.owner}</dd>
                      <dt>Size</dt>
                      <dd>{formatSize(detailFile.size)}</dd>
                      <dt>Last modified</dt>
                      <dd>{detailFile.modified}</dd>
                      <dt>Location</dt>
                      <dd>
                        {files.find((f) => f.id === detailFile.parent)?.name ||
                          'My files'}
                      </dd>
                      <dt>Access</dt>
                      <dd>
                        {detailFile.permission ||
                          (detailFile.shares?.length ? 'Shared' : 'Only you')}
                      </dd>
                    </dl>
                    {detailFile.description && <p>{detailFile.description}</p>}
                    <div className="detail-actions">
                      {page === 'trash' ? (
                        <>
                          <button
                            className="btn"
                            onClick={() => restoreItems([detailFile.id])}
                          >
                            Restore item
                          </button>
                          <button
                            className="btn danger-text"
                            onClick={() =>
                              setModal({
                                type: 'delete',
                                ids: [detailFile.id],
                                permanent: true,
                              })
                            }
                          >
                            Delete forever
                          </button>
                        </>
                      ) : (
                        <>
                          {!detailFile.received && (
                            <button
                              className="btn primary"
                              onClick={() =>
                                setModal({ type: 'share', file: detailFile })
                              }
                            >
                              <Icon name="share" size={16} />
                              Share & permissions
                            </button>
                          )}
                          {detailFile.type !== 'folder' && (
                            <button
                              className="btn"
                              onClick={() => download(detailFile)}
                            >
                              <Icon name="download" size={16} />
                              Download
                            </button>
                          )}
                          {canManage(detailFile) && (
                            <button
                              className="btn"
                              onClick={() =>
                                setModal({ type: 'rename', file: detailFile })
                              }
                            >
                              <Icon name="edit" size={16} />
                              Rename
                            </button>
                          )}
                          {!detailFile.received && (
                            <>
                              <button
                                className="btn"
                                onClick={() =>
                                  setModal({ type: 'move', file: detailFile })
                                }
                              >
                                <Icon name="folder" size={16} />
                                Move to folder
                              </button>
                              <button
                                className="btn danger-text"
                                onClick={() =>
                                  setModal({
                                    type: 'delete',
                                    ids: [detailFile.id],
                                  })
                                }
                              >
                                <Icon name="trash" size={16} />
                                Move to trash
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </aside>
                )}
              </div>
            </>
          )}
          {!isAdmin && page === 'upload' && (
            <UploadPage
              queue={queue}
              setQueue={setQueue}
              folders={folders}
              uploadFolder={uploadFolder}
              setUploadFolder={setUploadFolder}
              uploadError={uploadError}
              addQueue={addQueue}
              onUpload={upload}
            />
          )}
          {page === 'employees' && role === 'Admin' && (
            <EmployeesPage
              employees={employees}
              search={search}
              setSearch={setSearch}
              setModal={setModal}
            />
          )}
          {page === 'account' && (
            <AccountPage
              profile={currentUser}
              role={role}
              onPasswordChange={() =>
                notify('Password change simulated. No password was stored.')
              }
              onSignOut={() => {
                setSignedIn(false)
                setModal(null)
              }}
            />
          )}
          <footer className="app-footer">
            <span>
              Cloudspace <span>·</span> A place for your work.
            </span>
            <span>Cloud Storage & File Sharing System</span>
          </footer>
        </main>
      </div>
      {modal && (
        <Modal
          title={
            {
              folder: 'Create a folder',
              rename: 'Rename item',
              move: 'Move item',
              share: 'Share & permissions',
              delete: modal.permanent
                ? 'Permanently delete items?'
                : 'Move to trash?',
              preview: modal.file?.name,
              employee: modal.employee
                ? 'Edit employee'
                : 'Register employee account',
              employeeFiles: `Item records for ${modal.employee?.name}`,
              shareRecord: 'Sharing record',
              help: 'A little help for your workspace',
            }[modal.type]
          }
          description={
            {
              folder: 'Make a little room for your next big idea.',
              share: 'Choose who can access this item and what they can do.',
              employee: 'Manage employee details in this demo workspace.',
            }[modal.type]
          }
          onClose={() => setModal(null)}
          wide={['preview', 'employee'].includes(modal.type)}
        >
          {['folder', 'rename'].includes(modal.type) && (
            <NameForm
              defaultValue={modal.file?.name || ''}
              label={modal.type === 'folder' ? 'Folder name' : 'Item name'}
              onCancel={() => setModal(null)}
              onSave={(name) => {
                const parent = modal.file?.parent ?? folder
                if (
                  files.some(
                    (f) =>
                      f.id !== modal.file?.id &&
                      !f.deleted &&
                      f.parent === parent &&
                      f.name.toLowerCase() === name.toLowerCase(),
                  )
                )
                  return 'An item with this name already exists in this folder.'
                if (modal.type === 'folder')
                  setFiles((fs) => [
                    {
                      id: crypto.randomUUID(),
                      name,
                      type: 'folder',
                      parent: folder,
                      color: 'teal',
                      owner: 'You',
                      ownerId: profile.id,
                      modified: today(),
                    },
                    ...fs,
                  ])
                else update(modal.file.id, { name, modified: today() })
                setModal(null)
                notify(
                  modal.type === 'folder' ? 'Folder created' : 'Item renamed',
                )
              }}
            />
          )}
          {modal.type === 'share' && (
            <ShareForm
              file={files.find((f) => f.id === modal.file.id)}
              employees={employees}
              ownerEmail={profile.email}
              onSave={(data) => {
                update(modal.file.id, data)
                recordActivity(
                  'Sharing',
                  'Sharing permissions updated',
                  modal.file.name,
                  data.access === 'restricted'
                    ? 'Access restricted to the owner.'
                    : `${data.shares.length} employee recipient(s) assigned.`,
                )
                notify('Sharing settings saved in this preview')
              }}
              onClose={() => setModal(null)}
            />
          )}
          {modal.type === 'delete' && (
            <>
              <div className="delete-illustration">
                <Icon name="trash" size={28} />
              </div>
              <p className="dialog-copy">
                {modal.permanent
                  ? 'These demo items and their contents will be removed from this browser. This cannot be undone.'
                  : 'These items will move to Trash. You can restore them later.'}{' '}
                {modal.ids.length} item{modal.ids.length === 1 ? '' : 's'}{' '}
                selected.
              </p>
              <div className="form-footer">
                <button className="btn" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button
                  className="btn danger"
                  onClick={() => {
                    if (modal.permanent) {
                      const all = new Set(modal.ids)
                      let changed = true
                      while (changed) {
                        changed = false
                        files.forEach((f) => {
                          if (all.has(f.parent) && !all.has(f.id)) {
                            all.add(f.id)
                            changed = true
                          }
                        })
                      }
                      setFiles((fs) => fs.filter((f) => !all.has(f.id)))
                      all.forEach((id) => delete blobs.current[id])
                      setSelected([])
                      setDetail(null)
                      setModal(null)
                      notify('Demo items permanently deleted')
                    } else trashItems(modal.ids)
                  }}
                >
                  {modal.permanent ? 'Delete forever' : 'Move to trash'}
                </button>
              </div>
            </>
          )}
          {modal.type === 'move' && (
            <MoveForm
              file={modal.file}
              folders={folders}
              files={files}
              onSave={(parent) => {
                if (
                  files.some(
                    (f) =>
                      f.id !== modal.file.id &&
                      !f.deleted &&
                      f.parent === parent &&
                      f.name.toLowerCase() === modal.file.name.toLowerCase(),
                  )
                )
                  return 'An item with this name already exists in the destination.'
                update(modal.file.id, { parent, modified: today() })
                setModal(null)
                notify('Item moved')
              }}
              onCancel={() => setModal(null)}
            />
          )}
          {modal.type === 'preview' && (
            <>
              <div className="preview-area">
                {blobs.current[modal.file.id] &&
                ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(
                  modal.file.type,
                ) ? (
                  <ImagePreview file={blobs.current[modal.file.id]} />
                ) : blobs.current[modal.file.id] &&
                  ['txt', 'md', 'csv', 'json'].includes(modal.file.type) ? (
                  <TextPreview file={blobs.current[modal.file.id]} />
                ) : modal.file.content ? (
                  <pre>{modal.file.content}</pre>
                ) : (
                  <>
                    <FileIcon file={modal.file} large />
                    <h3>{modal.file.name}</h3>
                    <p>
                      {modal.file.uploaded && !blobs.current[modal.file.id]
                        ? 'The file contents are no longer in this session. Upload the file again to access its original contents.'
                        : blobs.current[modal.file.id]
                          ? 'Download this file to open it with a compatible application.'
                          : 'This is a sample file. Upload your own images or text files to preview their contents.'}
                    </p>
                  </>
                )}
              </div>
              <div className="form-footer">
                <span>
                  {formatSize(modal.file.size)} · {modal.file.owner}
                </span>
                <button
                  className="btn primary"
                  onClick={() => download(modal.file)}
                >
                  <Icon name="download" size={16} />
                  Download
                </button>
              </div>
            </>
          )}
          {isAdmin && modal.type === 'employee' && (
            <EmployeeForm
              employee={modal.employee}
              employees={employees}
              currentUserId={currentUser.id}
              onCancel={() => setModal(null)}
              onSave={(e) => {
                setEmployees((es) =>
                  modal.employee
                    ? es.map((x) => (x.id === e.id ? e : x))
                    : [...es, e],
                )
                if (e.id === profile.id) setProfile(e)
                const oldAccount = modal.employee
                setFiles((items) =>
                  items.map((file) => ({
                    ...file,
                    ownerId:
                      file.ownerId ||
                      getItemOwner(file, employees, profile)?.id,
                    owner:
                      getItemOwner(file, employees, profile)?.id === e.id &&
                      file.owner !== 'You'
                        ? e.name
                        : file.owner,
                    shares:
                      oldAccount && oldAccount.email !== e.email
                        ? file.shares?.map((share) =>
                            share.email === oldAccount.email
                              ? { ...share, email: e.email }
                              : share,
                          )
                        : file.shares,
                  })),
                )
                recordActivity(
                  'Account',
                  oldAccount ? 'Account updated' : 'Account created',
                  e.name,
                  oldAccount
                    ? `Status: ${oldAccount.status} → ${e.status}. Role: ${e.role}.`
                    : `${e.role} account registered in ${e.department}.`,
                )
                setModal(null)
                notify(
                  modal.employee
                    ? 'Employee updated'
                    : 'Employee account created in preview',
                )
              }}
            />
          )}
          {isAdmin && modal.type === 'employeeFiles' && (
            <div className="employee-files">
              <p className="form-note">
                Item names and sizes only. This view does not open or download
                employee files.
              </p>
              {files
                .filter(
                  (f) =>
                    !f.deleted &&
                    getItemOwner(f, employees, profile)?.id ===
                      modal.employee.id,
                )
                .map((f) => (
                  <div key={f.id}>
                    <FileIcon file={f} />
                    <span>{f.name}</span>
                    <small>{formatSize(f.size)}</small>
                  </div>
                ))}
              {!files.some(
                (f) =>
                  !f.deleted &&
                  getItemOwner(f, employees, profile)?.id === modal.employee.id,
              ) && <p>No files are owned by this employee.</p>}
            </div>
          )}
          {isAdmin && modal.type === 'shareRecord' && (
            <div className="share-record-detail">
              <div className="share-file">
                <FileIcon file={modal.record.file} />
                <div>
                  <strong>{modal.record.file.name}</strong>
                  <small>Company sharing metadata</small>
                </div>
              </div>
              <dl className="profile-details">
                {[
                  ['Owner', modal.record.owner],
                  ['Recipient', modal.record.recipient],
                  ['Email', modal.record.recipientEmail],
                  ['Permission', modal.record.permission],
                  ['Review status', modal.record.status],
                  ['Last modified', modal.record.file.modified],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="info-strip">
                This is a metadata review. Employees manage item permissions
                from their own workspace.
              </p>
              <div className="form-footer">
                <button className="btn primary" onClick={() => setModal(null)}>
                  Done
                </button>
              </div>
            </div>
          )}
          {modal.type === 'help' && (
            <div className="help-content">
              <p>This frontend follows the core screens in your UI sketches.</p>
              {(isAdmin
                ? adminHelp
                : [
                    [
                      'folder',
                      'My files',
                      'Create folders, organize items, and open file details to rename, move, or delete.',
                    ],
                    [
                      'upload',
                      'Upload files',
                      'Browse or drag files into the upload page. Original contents are available during this session.',
                    ],
                    [
                      'share',
                      'Share & permissions',
                      'Add recipients, choose read or read/write access, and generate a simulated sharing link.',
                    ],
                    [
                      'shield',
                      'Admin view',
                      'Use Admin view to manage accounts, review sharing metadata, and view local activity records.',
                    ],
                  ]
              ).map(([icon, title, text]) => (
                <div key={title}>
                  <Icon name={icon} />
                  <section>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </section>
                </div>
              ))}
              <div className="info-strip">
                This is a local frontend demo. Sign-in, passwords, permissions,
                and links do not connect to a server or enforce real access.
              </div>
              <button
                className="btn"
                onClick={() => {
                  localStorage.removeItem(STORE)
                  setFiles(initialFiles)
                  setEmployees(initialEmployees)
                  setProfile(initialEmployees[0])
                  setActivity(initialActivity)
                  blobs.current = {}
                  setQueue([])
                  setModal(null)
                  navigate(isAdmin ? 'overview' : 'files')
                  notify('Demo workspace reset')
                }}
              >
                Reset demo workspace
              </button>
            </div>
          )}
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={16} />
          </span>
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast('')}
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
