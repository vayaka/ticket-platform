import { useState } from 'react'
import { Form, Button, Alert, ProgressBar } from 'react-bootstrap'
import { FaUpload, FaTrash } from 'react-icons/fa'
import { validateFileSize, validateFileExtension } from '../../utils/validators'

const FileUploader = ({ onFileSelect, maxSize = 150 * 1024 * 1024, className = '' }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setError(null)

    if (!file) {
      setSelectedFile(null)
      return
    }

    // Проверка размера файла
    if (!validateFileSize(file.size, maxSize)) {
      setError(`Файл слишком большой. Максимальный размер: ${maxSize / (1024 * 1024)} МБ`)
      return
    }

    // Проверка типа файла
    if (!validateFileExtension(file.name)) {
      setError('Недопустимый тип файла')
      return
    }

    setSelectedFile(file)

    // Симулируем загрузку файла для демонстрации
    let uploadProgress = 0
    const interval = setInterval(() => {
      uploadProgress += 10
      setProgress(uploadProgress)
      if (uploadProgress >= 100) {
        clearInterval(interval)
        // Передаем файл родительскому компоненту
        onFileSelect(file)
      }
    }, 200)
  }

  const handleClear = () => {
    setSelectedFile(null)
    setProgress(0)
    setError(null)
    onFileSelect(null)
  }

  return (
    <div className={`file-uploader ${className}`}>
      {error && <Alert variant="danger" className="mb-2">{error}</Alert>}

      {!selectedFile ? (
        <Form.Group>
          <Form.Label>Прикрепить файл</Form.Label>
          <Form.Control
            type="file"
            onChange={handleFileChange}
          />
          <Form.Text className="text-muted">
            Максимальный размер файла: {maxSize / (1024 * 1024)} МБ
          </Form.Text>
        </Form.Group>
      ) : (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="text-truncate me-3">{selectedFile.name}</div>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleClear}
            >
              <FaTrash />
            </Button>
          </div>
          {progress < 100 ? (
            <ProgressBar now={progress} label={`${progress}%`} animated />
          ) : (
            <Alert variant="success" className="mb-0 py-1">Файл готов к отправке</Alert>
          )}
        </div>
      )}
    </div>
  )
}

export default FileUploader
