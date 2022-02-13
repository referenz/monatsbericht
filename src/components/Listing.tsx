import React, { forwardRef, MutableRefObject } from 'react';
import { Container } from 'react-bootstrap';
import Monatsbericht from '../Monatsbericht';

interface ListingProps extends React.ComponentPropsWithoutRef<'h2'> {
    className: string;
    projekte: MutableRefObject<Monatsbericht>;
}

const Listing = forwardRef<HTMLHeadingElement, ListingProps>((props, ref) => {
    const columns = [];
    const rows = [];

    const Tabelle = () => (
        <table>
            <caption></caption>
            <thead>
                <tr></tr>
            </thead>
            <tbody></tbody>
        </table>
    );

    return <Container className={props.className} ref={ref}></Container>;
});

export default Listing;
