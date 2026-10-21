import { useEffect, useState } from 'react'

export function ImagePreview({ file }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const u = URL.createObjectURL(file)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [file])
  return <img src={url} alt={file.name} />
}

export function TextPreview({ file }) {
  const [text, setText] = useState('')
  useEffect(() => {
    file.slice(0, 100000).text().then(setText)
  }, [file])
  return <pre>{text}</pre>
}
