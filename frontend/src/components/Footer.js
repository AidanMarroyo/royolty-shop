import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'

const Footer = () => {
  return (
    <Container>
      <footer>
        <Row>
          <Col className='text-center py-3'>
            Copyright &copy; Royolty Digital
          </Col>
        </Row>
      </footer>
    </Container>
  )
}

export default Footer
