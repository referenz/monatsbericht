import { Table } from 'react-bootstrap';
import Logger, { visible } from '../Logger';

function Log() {
    return (
        <Table className="logTable">
            <thead>
                <tr>
                    <th>Zeitpunkt</th>
                    <th>Level</th>
                    <th>Nachricht</th>
                </tr>
            </thead>
            <tbody>
                {Logger.log
                    .slice()
                    .filter((entry) => visible.includes(entry.level))
                    .reverse()
                    .map((entry, i) => {
                        let classname = '';
                        if (entry.level === 'error' || entry.level === 'fatal') classname += 'error';
                        if (entry.level === 'debug') classname += 'debug';
                        return (
                            <tr className={classname} key={i}>
                                <td>
                                    {entry.time.toLocaleDateString('de-DE', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        second: 'numeric',
                                    })}{' '}
                                    Uhr
                                </td>
                                <td>{entry.level}</td>
                                <td>{entry.message}</td>
                            </tr>
                        );
                    })}
            </tbody>
        </Table>
    );
}

export default Log;
