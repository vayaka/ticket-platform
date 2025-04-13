import { Link } from 'react-router-dom'
import { Row, Col, Breadcrumb } from 'react-bootstrap'
import TicketForm from '../components/tickets/TicketForm'

const CreateTicketPage = () => {
  return (
    <div>
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          Главная
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/tickets' }}>
          Заявки
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Создание заявки</Breadcrumb.Item>
      </Breadcrumb>

      <div className="mb-4">
        <h2>Создание новой заявки</h2>
        <p className="text-muted">
          Заполните форму ниже, чтобы создать новую заявку. Все поля, отмеченные звездочкой (*), обязательны для заполнения.
        </p>
      </div>

      <Row>
        <Col lg={9}>
          <TicketForm />
        </Col>
        <Col lg={3}>
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Рекомендации</h5>
            </div>
            <div className="card-body">
              <p className="small mb-3">
                Чтобы ваша заявка была обработана максимально быстро и эффективно,
                пожалуйста, следуйте этим рекомендациям:
              </p>
              <ul className="small">
                <li className="mb-2">
                  <strong>Будьте конкретны.</strong> Четко опишите проблему или запрос.
                </li>
                <li className="mb-2">
                  <strong>Укажите все детали.</strong> Версии ПО, модели оборудования и т.д.
                </li>
                <li className="mb-2">
                  <strong>Прикрепите файлы.</strong> Скриншоты или документы помогут лучше
                  понять вашу проблему.
                </li>
                <li className="mb-2">
                  <strong>Выберите правильный приоритет.</strong> Не ставьте "Критический"
                  для некритичных проблем.
                </li>
                <li>
                  <strong>Выберите правильную категорию.</strong> Это поможет назначить
                  заявку подходящему специалисту.
                </li>
              </ul>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default CreateTicketPage
