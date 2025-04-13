import { useState } from 'react'
import { Card, Row, Col, Form, Button, Alert, Table, Badge } from 'react-bootstrap'
import { FaFilePdf, FaFileExcel, FaChartBar, FaFilter } from 'react-icons/fa'
import { useContext } from 'react'
import { TicketContext } from '../contexts/TicketContext'

const ReportsPage = () => {
  const { allTickets } = useContext(TicketContext)
  const [reportType, setReportType] = useState('tickets-by-status')
  const [period, setPeriod] = useState('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [generatedReport, setGeneratedReport] = useState(null)
  const [showAlert, setShowAlert] = useState(false)

  // Вспомогательные функции
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU')
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'new': return 'primary'
      case 'assigned': return 'info'
      case 'in-progress': return 'warning'
      case 'completed': return 'success'
      default: return 'secondary'
    }
  }

  const getStatusName = (status) => {
    switch (status) {
      case 'new': return 'Новая'
      case 'assigned': return 'Назначена'
      case 'in-progress': return 'В работе'
      case 'completed': return 'Выполнена'
      default: return status
    }
  }

  // Обработка генерации отчета
  const handleGenerateReport = () => {
    // Определяем даты для фильтрации
    let filterStartDate = new Date()
    let filterEndDate = new Date()

    if (period === 'custom' && startDate && endDate) {
      filterStartDate = new Date(startDate)
      filterEndDate = new Date(endDate)
    } else {
      // Предустановленные периоды
      filterEndDate = new Date()

      if (period === 'week') {
        filterStartDate.setDate(filterStartDate.getDate() - 7)
      } else if (period === 'month') {
        filterStartDate.setMonth(filterStartDate.getMonth() - 1)
      } else if (period === 'quarter') {
        filterStartDate.setMonth(filterStartDate.getMonth() - 3)
      } else if (period === 'year') {
        filterStartDate.setFullYear(filterStartDate.getFullYear() - 1)
      }
    }

    // Фильтруем заявки по дате
    const filteredTickets = allTickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt)
      return ticketDate >= filterStartDate && ticketDate <= filterEndDate
    })

    // Генерируем отчет в зависимости от типа
    let reportData = {}

    if (reportType === 'tickets-by-status') {
      reportData = {
        title: 'Отчет по статусам заявок',
        period: `${formatDate(filterStartDate)} - ${formatDate(filterEndDate)}`,
        data: {
          new: filteredTickets.filter(t => t.status === 'new').length,
          assigned: filteredTickets.filter(t => t.status === 'assigned').length,
          inProgress: filteredTickets.filter(t => t.status === 'in-progress').length,
          completed: filteredTickets.filter(t => t.status === 'completed').length,
          total: filteredTickets.length
        },
        tickets: filteredTickets
      }
    } else if (reportType === 'tickets-by-department') {
      // Группировка по отделам
      const departments = {}
      filteredTickets.forEach(ticket => {
        const dept = ticket.department
        if (!departments[dept]) {
          departments[dept] = {
            total: 0,
            new: 0,
            assigned: 0,
            inProgress: 0,
            completed: 0
          }
        }
        departments[dept].total++
        departments[dept][ticket.status === 'in-progress' ? 'inProgress' : ticket.status]++
      })

      reportData = {
        title: 'Отчет по отделам',
        period: `${formatDate(filterStartDate)} - ${formatDate(filterEndDate)}`,
        data: departments,
        tickets: filteredTickets
      }
    } else if (reportType === 'response-time') {
      // Для демо просто используем случайные значения
      reportData = {
        title: 'Отчет по времени ответа',
        period: `${formatDate(filterStartDate)} - ${formatDate(filterEndDate)}`,
        data: {
          averageResponseTime: Math.floor(Math.random() * 24) + 1,
          averageResolutionTime: Math.floor(Math.random() * 72) + 24,
          criticalResponseTime: Math.floor(Math.random() * 12) + 1,
          highResponseTime: Math.floor(Math.random() * 18) + 2,
        },
        tickets: filteredTickets
      }
    }

    setGeneratedReport(reportData)
    setShowAlert(false)
  }

  // Обработка экспорта отчета
  const handleExportReport = (format) => {
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  return (
    <div>
      <h2 className="mb-4">Отчеты</h2>

      {showAlert && (
        <Alert
          variant="info"
          dismissible
          onClose={() => setShowAlert(false)}
          className="mb-4"
        >
          Функция экспорта отчетов находится в разработке
        </Alert>
      )}

      <Row>
        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaFilter className="me-2" /> Параметры отчета
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Тип отчета</Form.Label>
                  <Form.Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="tickets-by-status">Заявки по статусам</option>
                    <option value="tickets-by-department">Заявки по отделам</option>
                    <option value="response-time">Время ответа и выполнения</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Период</Form.Label>
                  <Form.Select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option value="week">Неделя</option>
                    <option value="month">Месяц</option>
                    <option value="quarter">Квартал</option>
                    <option value="year">Год</option>
                    <option value="custom">Произвольный период</option>
                  </Form.Select>
                </Form.Group>

                {period === 'custom' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Начальная дата</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Конечная дата</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </Form.Group>
                  </>
                )}

                <div className="d-grid">
                  <Button
                    variant="primary"
                    onClick={handleGenerateReport}
                  >
                    Сформировать отчет
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {generatedReport && (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Экспорт отчета</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-primary"
                    className="d-flex align-items-center justify-content-center"
                    onClick={() => handleExportReport('pdf')}
                  >
                    <FaFilePdf className="me-2" /> Экспорт в PDF
                  </Button>
                  <Button
                    variant="outline-success"
                    className="d-flex align-items-center justify-content-center"
                    onClick={() => handleExportReport('excel')}
                  >
                    <FaFileExcel className="me-2" /> Экспорт в Excel
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={8}>
          {!generatedReport ? (
            <Card className="shadow-sm h-100">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center text-muted py-5">
                <FaChartBar size={64} className="mb-3" />
                <h4>Выберите параметры отчета</h4>
                <p>Настройте параметры слева и нажмите "Сформировать отчет"</p>
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">{generatedReport.title}</h5>
                <div className="text-muted small">
                  Период: {generatedReport.period}
                </div>
              </Card.Header>
              <Card.Body>
                {reportType === 'tickets-by-status' && (
                  <>
                    <Row className="mb-4">
                      <Col sm={6} md={3} className="mb-3">
                        <Card className="text-center h-100">
                          <Card.Body>
                            <h1 className="mb-1">{generatedReport.data.total}</h1>
                            <div className="text-muted">Всего заявок</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col sm={6} md={3} className="mb-3">
                        <Card className="text-center h-100 border-primary">
                          <Card.Body>
                            <h1 className="mb-1 text-primary">{generatedReport.data.new}</h1>
                            <div className="text-muted">Новых</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col sm={6} md={3} className="mb-3">
                        <Card className="text-center h-100 border-warning">
                          <Card.Body>
                            <h1 className="mb-1 text-warning">{generatedReport.data.inProgress}</h1>
                            <div className="text-muted">В работе</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col sm={6} md={3} className="mb-3">
                        <Card className="text-center h-100 border-success">
                          <Card.Body>
                            <h1 className="mb-1 text-success">{generatedReport.data.completed}</h1>
                            <div className="text-muted">Выполнено</div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <div className="mb-4">
                      <h5 className="mb-3">Диаграмма распределения по статусам</h5>
                      <div className="progress" style={{ height: '30px' }}>
                        <div
                          className="progress-bar bg-primary"
                          style={{ width: `${generatedReport.data.total ? (generatedReport.data.new / generatedReport.data.total) * 100 : 0}%` }}
                        >
                          Новые
                        </div>
                        <div
                          className="progress-bar bg-info"
                          style={{ width: `${generatedReport.data.total ? (generatedReport.data.assigned / generatedReport.data.total) * 100 : 0}%` }}
                        >
                          Назначены
                        </div>
                        <div
                          className="progress-bar bg-warning"
                          style={{ width: `${generatedReport.data.total ? (generatedReport.data.inProgress / generatedReport.data.total) * 100 : 0}%` }}
                        >
                          В работе
                        </div>
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${generatedReport.data.total ? (generatedReport.data.completed / generatedReport.data.total) * 100 : 0}%` }}
                        >
                          Выполнено
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {reportType === 'tickets-by-department' && (
                  <div className="mb-4">
                    <h5 className="mb-3">Распределение заявок по отделам</h5>
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Отдел</th>
                          <th>Всего</th>
                          <th>Новых</th>
                          <th>В работе</th>
                          <th>Выполнено</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(generatedReport.data).map(([dept, data]) => (
                          <tr key={dept}>
                            <td>{dept}</td>
                            <td>{data.total}</td>
                            <td>{data.new}</td>
                            <td>{data.inProgress}</td>
                            <td>{data.completed}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}

                {reportType === 'response-time' && (
                  <div className="mb-4">
                    <Row>
                      <Col sm={6} className="mb-3">
                        <Card className="text-center h-100">
                          <Card.Body>
                            <h2 className="mb-1">{generatedReport.data.averageResponseTime} ч</h2>
                            <div className="text-muted">Среднее время реакции</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col sm={6} className="mb-3">
                        <Card className="text-center h-100">
                          <Card.Body>
                            <h2 className="mb-1">{generatedReport.data.averageResolutionTime} ч</h2>
                            <div className="text-muted">Среднее время решения</div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <h5 className="mb-3">Время реакции по приоритетам</h5>
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Приоритет</th>
                          <th>Среднее время реакции</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <Badge bg="danger">Критический</Badge>
                          </td>
                          <td>{generatedReport.data.criticalResponseTime} ч</td>
                        </tr>
                        <tr>
                          <td>
                            <Badge bg="warning">Высокий</Badge>
                          </td>
                          <td>{generatedReport.data.highResponseTime} ч</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                )}

                {/* Таблица заявок */}
                <h5 className="mt-4 mb-3">Заявки в отчетном периоде</h5>
                {generatedReport.tickets.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Название</th>
                          <th>Статус</th>
                          <th>Создана</th>
                          <th>Отдел</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedReport.tickets.slice(0, 10).map(ticket => (
                          <tr key={ticket.id}>
                            <td>#{ticket.id}</td>
                            <td>{ticket.title}</td>
                            <td>
                              <Badge bg={getStatusVariant(ticket.status)}>
                                {getStatusName(ticket.status)}
                              </Badge>
                            </td>
                            <td>{formatDate(ticket.createdAt)}</td>
                            <td>{ticket.department}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    {generatedReport.tickets.length > 10 && (
                      <div className="text-center mt-2">
                        <em>Показаны только первые 10 заявок из {generatedReport.tickets.length}</em>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted py-3">
                    <p>Нет заявок за выбранный период</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default ReportsPage
