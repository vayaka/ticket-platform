import { useParams, Link } from 'react-router-dom'
import { Breadcrumb } from 'react-bootstrap'
import TicketDetail from '../components/tickets/TicketDetail'

const TicketDetailPage = () => {
  const { id } = useParams()

  return (
    <div>
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          Главная
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/tickets' }}>
          Заявки
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Заявка #{id}</Breadcrumb.Item>
      </Breadcrumb>

      <TicketDetail />
    </div>
  )
}

export default TicketDetailPage
