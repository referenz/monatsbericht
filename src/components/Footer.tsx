import { useEffect, useState } from 'react';
import { Container, Image, Offcanvas } from 'react-bootstrap';
import Logger from '../service/Logger';
import './Footer.css';
import infoIcon from '../assets/info-circle-fill.svg';
import xIcon from '../assets/x-circle-fill.svg';
import Log from './Log';

function Footer() {
  const [, setLogEntries] = useState<number>(Logger.log.length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setLogEntries(Logger.log.length));

  const [showLogs, setShowLogs] = useState(false);
  const handleShow = () => setShowLogs(true);
  const handleClose = () => setShowLogs(false);

  const LogButton = () => {
    if (!Logger.hasVisibleMsg) return null;

    const buttonLabel =
      (Logger.countVisibleMsgs() === 1 ? 'Eine Ereignismeldung ' : `${Logger.countVisibleMsgs()} Ereignismeldungen `) +
      'vorhanden';
    const buttonImage = Logger.counter.error > 0 || Logger.counter.fatal > 0 ? xIcon : infoIcon;

    return (
      <button type="button" title={buttonLabel} id="logButton" onClick={handleShow}>
        <Image src={buttonImage} alt={buttonLabel} />
      </button>
    );
  };

  return (
    <>
      <Container as="footer" fluid className="fixed-bottom">
        <div>
          <h1>Monatsberichtsauswertung</h1>
          <LogButton />
        </div>
        <a
          className="github"
          rel="noopener noreferrer"
          target="_blank"
          href="https://github.com/referenz/monatsbericht"
        >
          Quellcode
        </a>
      </Container>

      <Offcanvas show={showLogs} onHide={handleClose} placement="bottom">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Ereignisprotokoll</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Log />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Footer;
