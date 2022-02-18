import { Container } from 'react-bootstrap';
import './Footer.css';

function Footer() {
    return (
        <Container fluid className="fixed-bottom" id="footer">
            <h1>Monatsberichtsauswertung</h1>
            <span>
                <a
                    className="github"
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://github.com/referenz/monatslisten-auswertung"
                >
                    Quellcode
                </a>
            </span>
        </Container>
    );
}

export default Footer;
