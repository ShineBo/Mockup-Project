import { useEffect, useRef } from 'react'
import Icon from '../icons'

export function Badge({ children, tone = '' }) {
  return <span className={`badge ${tone}`}>{children}</span>
}

export function FileIcon({ file, large = false }) {
  const type = file.type
  return (
    <span
      className={`file-icon ${type} ${file.color || ''} ${large ? 'large' : ''}`}
    >
      <Icon
        name={
          type === 'folder'
            ? 'folder'
            : ['jpg', 'png', 'jpeg', 'webp'].includes(type)
              ? 'image'
              : 'file'
        }
        size={large ? 30 : 21}
      />
      {type !== 'folder' && <small>{type.toUpperCase()}</small>}
    </span>
  )
}

export function Modal({ title, description, children, onClose, wide = false }) {
  const ref = useRef(null)
  useEffect(() => {
    const prev = document.activeElement
    ref.current?.focus()
    const key = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const els = [
          ...ref.current.querySelectorAll(
            'button,input,select,textarea,a[href]',
          ),
        ].filter((x) => !x.disabled)
        if (!els.length) return
        if (
          e.shiftKey &&
          (document.activeElement === els[0] ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault()
          els.at(-1).focus()
        } else if (!e.shiftKey && document.activeElement === els.at(-1)) {
          e.preventDefault()
          els[0].focus()
        }
      }
    }
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('keydown', key)
      prev?.focus()
    }
  }, [onClose])
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <section
        className={`modal ${wide ? 'wide' : ''}`}
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          className="icon-btn modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <Icon name="x" />
        </button>
        <h2>{title}</h2>
        {description && <p className="modal-description">{description}</p>}
        {children}
      </section>
    </div>
  )
}

export function Logo() {
  return (
    <div className="logo">
      <span>
        <Icon name="cloud" size={25} />
      </span>
      <strong>
        cloudspace<span>®</span>
      </strong>
    </div>
  )
}
