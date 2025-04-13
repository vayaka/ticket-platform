import { Spinner } from 'react-bootstrap'

const Loader = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </div>
    )
  }

  return (
    <div className="d-flex justify-content-center py-5">
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Загрузка...</span>
      </Spinner>
    </div>
  )
}

export default Loader
