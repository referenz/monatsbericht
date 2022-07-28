import { ReactNode, createRef, SyntheticEvent, useEffect, useRef, useState } from 'react';
import './Tabelle_Projektliste.css';
import Monatsbericht from '../Monatsbericht';
import Infofelder from '../infofelder.json';

function formatCurrency(num: string): string {
    const number = parseFloat(num) || 0;
    if (number === 0) return '';
    return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Euro';
}

function Projektliste(props: {
    monatsbericht: Monatsbericht;
    mode?: 'Liste' | 'Vergleich_Zuwendung' | 'Vergleich_Bezeichnung';
    projekte?: string[][]; //[Handlungsbereich[Projektnummer]]
    monatsbericht_alt?: Monatsbericht;
    abweichende_daten?: [string, Map<string, string[]>][]; // [Handlungsbereich[Map<projektnummer, abweichende]]
    tabellen_headline_h2?: boolean;
    children?: ReactNode;
}) {
    const caption = useRef([]);

    // Zuordnung: Welches Handlungsfeld kriegt welche Spalten angezeigt
    const [zuordnungen, setZuordnungen] = useState<Map<string, string[]>>();
    useEffect(() => {
        const zuwendungsfelder = props.mode === 'Vergleich_Zuwendung' ? Monatsbericht.vergleichsfelder_zuwendungen : [];
        const hilfszuordnung = new Map();
        const infofelder = new Map(Object.entries(Infofelder));
        Monatsbericht.handlungsbereiche.forEach((_, handlungsbereich) => {
            hilfszuordnung.set(handlungsbereich, [
                'Projektnr.',
                ...(infofelder.has(handlungsbereich) ? infofelder.get(handlungsbereich) : infofelder.get('default')),
                ...zuwendungsfelder,
            ]);
        });
        setZuordnungen(() => new Map(hilfszuordnung));
    }, [props.mode]);

    // Daten befüllen
    const [projektliste, setProjektliste] = useState([]); // [Handlungsbereich[Projektnummer]]
    const [abweichendeFelder, setAbweichendeFelder] = useState(new Map());
    useEffect(() => {
        // Fall 1: Ausgabe aller Projekte, geordnet nach Handlungsbereichen oder Ausgabe der angegebenen Projekte
        if (props.mode === 'Liste' || !props.mode) {
            setProjektliste(
                !props.projekte
                    ? Array.from(props.monatsbericht.get_projekte({ ordered: true }) as Map<string, string[]>)
                    : props.projekte
            );
        }
        // Fall 2: Ausgabe der Projekte mit Abweichungen, geordnet nach Handlungsbereichen
        else if (props.mode === 'Vergleich_Zuwendung' || props.mode === 'Vergleich_Bezeichnung') {
            // Überführung in das Projektlisten-Format [Handlungsbereich[Projektnummer]] + paralleles Verzeichnis
            // mit abweichenden Feldern für jedes Projekt
            const projekte = [];
            const abweichende = [];
            props.abweichende_daten.forEach((handlungsbereich) => {
                const handlungsbereichsprojekte = [];
                handlungsbereich[1].forEach((felder_abweichend, projektnummer) => {
                    handlungsbereichsprojekte.push(projektnummer);
                    abweichende.push([projektnummer, felder_abweichend]);
                });
                projekte.push([handlungsbereich[0], handlungsbereichsprojekte]);
            });
            setProjektliste(projekte);
            setAbweichendeFelder(new Map(abweichende));
        }
    }, [props.abweichende_daten, props.mode, props.monatsbericht, props.projekte]);

    const Tabellen = projektliste.map((handlungsbereich, i) => {
        if (zuordnungen === undefined) return null;

        let columns = [];
        if (props.mode === 'Liste' || !props.mode) columns = zuordnungen.get(handlungsbereich[0]);
        else if (props.mode === 'Vergleich_Zuwendung')
            columns = zuordnungen
                .get(handlungsbereich[0])
                .filter((feld) => feld !== 'Bewilligungszeit' && feld !== 'Projektlaufzeit');
        else if (props.mode === 'Vergleich_Bezeichnung') columns = ['Projektnr.', 'Trägername', 'Projekttitel'];

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

        caption.current[i] = createRef();

        function collapseTable(e: SyntheticEvent) {
            const button = e.target as HTMLButtonElement;
            button.innerText = (e.target as HTMLButtonElement).innerText === 'Einklappen' ? 'Ausklappen' : 'Einklappen';

            const table = button.parentElement.parentElement.parentElement.parentElement as HTMLTableElement;
            if (table.classList.contains('collapsed')) table.classList.remove('collapsed');
            table.classList.toggle('collapsing');
            table.addEventListener('transitionend', () => {
                if (table.classList.contains('collapsing')) table.classList.add('collapsed');
            });
        }

        return (
            <table
                key={handlungsbereich[0]}
                className="projektliste"
                id={props.mode === 'Liste' ? handlungsbereich[0] : undefined}
            >
                <caption ref={(el) => (caption.current[i] = el)}>
                    <span className="caption-flexbox">
                        <span className="caption-text">
                            {props.children && <span className="expand">{props.children}:&nbsp;</span>}
                            {handlungsbereich[0]}
                            <span className="projektzahl"> ({rows.length})</span>
                        </span>
                        <span className="collapse-link">
                            <button type="button" onClick={(e) => collapseTable(e)}>
                                Einklappen
                            </button>
                        </span>
                    </span>
                </caption>
                <thead>
                    <tr>
                        {columns.map((column) => {
                            return <th key={column}>{column}</th>;
                        })}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((projekt) => {
                        return (
                            <tr key={projekt[0].value}>
                                {projekt.map((cell: Record<string, string>) => {
                                    const key = `${cell.spalte}${cell.value}`;
                                    let curr_class = cell.spalte.replace(' ', '-').replace('.', '').toLowerCase();

                                    let output: ReactNode;
                                    if (cell.spalte === 'Bewilligungszeit' || cell.spalte === 'Projektlaufzeit') {
                                        if (cell.value !== undefined) output = `${cell.value[0]} - ${cell.value[1]}`;
                                        else output = '';
                                    } else if (
                                        props.mode === 'Vergleich_Zuwendung' &&
                                        cell.spalte.startsWith('Zuwendung')
                                    ) {
                                        const changed = abweichendeFelder.get(projekt[0].value).includes(cell.spalte);
                                        if (!changed) output = formatCurrency(cell.value);
                                        else {
                                            curr_class += ' changed';
                                            output = (
                                                <>
                                                    {props.monatsbericht_alt.get_projekt(
                                                        projekt[0].value,
                                                        cell.spalte
                                                    ) !== 0 && (
                                                        <span className="wert-alt">
                                                            {formatCurrency(
                                                                props.monatsbericht_alt.get_projekt(
                                                                    projekt[0].value,
                                                                    cell.spalte
                                                                ) as string
                                                            )}
                                                            <br />
                                                        </span>
                                                    )}
                                                    <span className="wert-neu">{formatCurrency(cell.value)}</span>
                                                </>
                                            );
                                        }
                                    } else if (
                                        props.mode === 'Vergleich_Bezeichnung' &&
                                        (cell.spalte === 'Trägername' || cell.spalte === 'Projekttitel')
                                    ) {
                                        const changed = abweichendeFelder.get(projekt[0].value).includes(cell.spalte);
                                        if (!changed) output = cell.value;
                                        else {
                                            curr_class += ' changed';
                                            output = (
                                                <>
                                                    <span className="wert-alt">
                                                        {
                                                            props.monatsbericht_alt.get_projekt(
                                                                projekt[0].value,
                                                                cell.spalte
                                                            ) as string
                                                        }
                                                    </span>
                                                    <br />
                                                    <span className="wert-neu">{cell.value}</span>
                                                </>
                                            );
                                        }
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

    // Der Oberserver kann offenbar erst nach der Tabellendefinition gesetzt werden
    const [observerDone, setObserverDone] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([e]) => e.target.classList.toggle('is-pinned', e.intersectionRatio < 1),
            {
                rootMargin: '0px 0px 100000px 0px',
                threshold: [1],
            }
        );
        caption.current.forEach((el) => observer.observe(el));
        setObserverDone(true);
    }, [Tabellen]);

    /*
    function Inhaltsverzeichnis() {
        return (
            <div className="inhaltsverzeichnis">
                <p>Aktueller Monatsbericht</p>
                <Button as="span" size="sm">
                    Verbergen
                </Button>

                <ul>
                    {projektliste.map((handlungsbereich) => {
                        return (
                            <li key={handlungsbereich[0]}>
                                <a href={'#' + handlungsbereich[0]}>{handlungsbereich[0]}</a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }
    */

    return (
        <>
            {props.children && !props.tabellen_headline_h2 && <h3>{props.children}</h3>}
            {props.children && props.tabellen_headline_h2 && <h2>{props.children}</h2>}
            {observerDone && Tabellen}
        </>
    );
}

export default Projektliste;
