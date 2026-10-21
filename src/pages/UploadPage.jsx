import { useRef } from 'react'
import Icon from '../icons'
import { FileIcon } from '../components/ui'
import { formatSize } from '../data'

export default function UploadPage({
  queue,
  setQueue,
  folders,
  uploadFolder,
  setUploadFolder,
  uploadError,
  addQueue,
  onUpload,
}) {
  const fileInput = useRef(null)
  return (
    <div className="upload-layout">
      <section className="panel upload-panel">
        <h2>Upload to your workspace</h2>
        <p>Choose your files, then pick where they belong.</p>
        <div
          className="dropzone"
          onDragOver={(e) => {
            e.preventDefault()
            e.currentTarget.classList.add('dragging')
          }}
          onDragLeave={(e) => e.currentTarget.classList.remove('dragging')}
          onDrop={(e) => {
            e.preventDefault()
            e.currentTarget.classList.remove('dragging')
            addQueue(e.dataTransfer.files)
          }}
        >
          <span className="upload-cloud">
            <Icon name="upload" size={32} />
          </span>
          <h3>Drag and drop your files here</h3>
          <p>or choose them from your computer</p>
          <button
            className="btn primary"
            onClick={() => fileInput.current.click()}
          >
            Browse files
          </button>
          <small>Up to 25 MB per file in this preview</small>
          <input
            ref={fileInput}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              addQueue(e.target.files)
              e.target.value = ''
            }}
          />
        </div>
        {uploadError && (
          <p role="alert" className="error-message">
            {uploadError}
          </p>
        )}
        {queue.length > 0 && (
          <div className="upload-queue">
            <h3>
              Ready to upload <span>{queue.length}</span>
            </h3>
            {queue.map((q) => (
              <div className="queue-item" key={q.id}>
                <FileIcon
                  file={{ type: q.file.name.split('.').pop().toLowerCase() }}
                />
                <label>
                  File name
                  <input
                    aria-label={`File name for ${q.file.name}`}
                    value={q.name}
                    onChange={(e) =>
                      setQueue((prev) =>
                        prev.map((x) =>
                          x.id === q.id ? { ...x, name: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </label>
                <small>{formatSize(q.file.size)}</small>
                <button
                  className="icon-btn"
                  aria-label={`Remove ${q.file.name}`}
                  onClick={() =>
                    setQueue((prev) => prev.filter((x) => x.id !== q.id))
                  }
                >
                  <Icon name="x" size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="destination-label">
          Save to folder
          <select
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value)}
          >
            <option value="">My files (root)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <div className="form-footer">
          <span>
            {queue.length} file{queue.length !== 1 ? 's' : ''} selected
          </span>
          <button
            className="btn primary"
            disabled={!queue.length || queue.some((q) => !q.name.trim())}
            onClick={onUpload}
          >
            <Icon name="upload" size={17} />
            Upload {queue.length || ''} {queue.length === 1 ? 'file' : 'files'}
          </button>
        </div>
      </section>
      <aside className="upload-tips">
        <div className="tips-icon">
          <Icon name="folder" size={34} />
        </div>
        <h3>A tidy start.</h3>
        <p>Choose a folder now to make your files easier to find later.</p>
        <hr />
        <div>
          <Icon name="check" size={17} />
          <p>Keep original file extensions when renaming files.</p>
        </div>
        <div>
          <Icon name="check" size={17} />
          <p>Share a file after uploading to choose who can access it.</p>
        </div>
        <div>
          <Icon name="info" size={17} />
          <p>
            File contents stay in this browser session. Metadata is saved
            locally; refreshing clears uploaded contents.
          </p>
        </div>
      </aside>
    </div>
  )
}
