import { ReactChild } from 'react';
import Infofelder from '../infofelder.json';
import Monatsbericht from '../Monatsbericht';

function Listing(props: { projekte: [string, string[]][]; monatsbericht: Monatsbericht; children: ReactChild }) {
    const zuordnungen: Map<string, string[]> = new Map();
    const infofelder = new Map(Object.entries(Infofelder));
    Monatsbericht.handlungsbereiche.forEach((handlungsbereich) => {
        zuordnungen.set(handlungsbereich, [
            'Projektnr.',
            ...(infofelder.has(handlungsbereich) ? infofelder.get(handlungsbereich) : infofelder.get('default')),
        ]);
    });

    const Tabellen = props.projekte.map((handlungsbereich) => {
        const columns: string[] = zuordnungen.get(handlungsbereich[0]);
        const rows = [];

        handlungsbereich[1].forEach((projekt: string) => {
            const daten = [];
            columns.forEach((spalte) => {
                const zelle = {
                    spalte: spalte,
                    value: props.monatsbericht.get_projekt(projekt, spalte) as string | string[],
                };
                daten.push(zelle);
            });
            rows.push(daten);
        });

        return (
            <table key={handlungsbereich[0]} className="projektliste">
                <caption style={{ captionSide: 'top' }}>{handlungsbereich[0]}</caption>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column}>{column}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((projekt) => {
                        return (
                            <tr key={projekt[0].value}>
                                {projekt.map((cell: Record<string, string>) => {
                                    const key = `${cell.spalte}${cell.value}`;
                                    const curr_class = cell.spalte.replace(' ', '-').replace('.', '').toLowerCase();

                                    let output: string;
                                    if (cell.spalte === 'Bewilligungszeit' || cell.spalte === 'Projektlaufzeit') {
                                        if (cell.value !== undefined) output = `${cell.value[0]} - ${cell.value[1]}`;
                                        else output = '';
                                    } else output = cell.value;

                                    return (
                                        <td className={curr_class} key={key}>
                                            {output}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    });

    return (
        <>
            <h3>{props.children}</h3>
            {Tabellen}
        </>
    );
}

export default Listing;
