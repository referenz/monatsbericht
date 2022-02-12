import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
// import Monatslistenauswertung from './../module.monatslistenauswertung';

function InputForm() {
    function handleSubmit(e) {
        e.preventDefault();

        const files = [];
        files.push(e.target.datei_neu.files[0]);
        if (!(e.target.datei_alt.files[0] === undefined)) files.push(e.target.datei_alt.files[0]);

        const output = new Map();
        files.forEach((file) => output.set(file.name, file.arrayBuffer()));
    }

    return (
        <Form className="mt-2" onSubmit={(e) => handleSubmit(e)}>
            <Row className="mb-3">
                <Col>
                    <Form.Group controlId="datei_neu">
                        <Form.Label>Akutelle Monatsliste hochladen:</Form.Label>
                        <Form.Control type="file" />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId="datei_alt">
                        <Form.Label>Alte Monatsliste zum Vergleichen hochladen:</Form.Label>
                        <Form.Control type="file" />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="pb-3">
                <Form.Group controlId="buttongroup" className="text-center">
                    <Button type="submit" className="mx-2 btn-primary">
                        Auswerten
                    </Button>
                    <Button type="reset" className="mx-2 btn-secondary">
                        Datei(en) entfernen
                    </Button>
                </Form.Group>
            </Row>
        </Form>
    );
}

export default InputForm;
