import React, { forwardRef, MutableRefObject, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import Monatsbericht from '../Monatsbericht';

interface ListingProps extends React.ComponentPropsWithoutRef<'h2'> {
    className: string;
    monatsbericht: MutableRefObject<Monatsbericht>;
}

const Listing = forwardRef<HTMLHeadingElement, ListingProps>((props, ref) => {
    const projekte = Array.from(props.monatsbericht.current.get_projekte());

    return (
        <Container className={props.className} ref={ref}>
            <h2>Projekte</h2>
            <table>
                <colgroup>
                    <col />
                    <col />
                </colgroup>
                <thead>
                    <tr>
                        <th>Projektnr.</th>
                        <th>Zuwendung 2020</th>
                    </tr>
                </thead>
                <tbody>
                    {projekte.map((projekt) => (
                        <tr key={projekt[0]}>
                            <td>{projekt[0]}</td>
                            <td style={{ textAlign: 'right' }}>{projekt[1]['Zuwendung 2020']} Euro</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Container>
    );
});

export default Listing;
