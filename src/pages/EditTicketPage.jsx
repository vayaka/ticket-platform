import { Link, useParams } from 'react-router-dom'
import { Breadcrumb } from 'react-bootstrap'
import TicketEditForm from '../components/tickets/TicketEditForm'

const EditTicketPage = () => {
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
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/tickets/${id}` }}>
          Заявка #{id}
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Редактирование</Breadcrumb.Item>
      </Breadcrumb>

      <div className="mb-4">
        <h2>Редактирование заявки #{id}</h2>
        <p className="text-muted">
          Внесите необходимые изменения в форму ниже и нажмите "Сохранить изменения".
        </p>
      </div>

      <TicketEditForm />
    </div>
  )
}

export default EditTicketPage
