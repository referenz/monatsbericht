import { ReactNode, SyntheticEvent, useEffect, useRef } from 'react';
import TableCell from '../types/TableCell';

function collapseTable(e: SyntheticEvent) {
  const button = e.target as HTMLButtonElement;
  button.innerText = (e.target as HTMLButtonElement).innerText === 'Einklappen' ? 'Ausklappen' : 'Einklappen';

  const table = button.parentElement?.parentElement?.parentElement?.parentElement as HTMLTableElement;
  if (table.classList.contains('collapsed')) table.classList.remove('collapsed');
  table.classList.toggle('collapsing');
  table.addEventListener('transitionend', () => {
    if (table.classList.contains('collapsing')) table.classList.add('collapsed');
  });
}

function TabelleGeruest(props: {
  columns: string[];
  rows: TableCell[][];
  expandHeadline?: string;
  children?: ReactNode;
}) {
  const caption = useRef<HTMLTableCaptionElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => e.target.classList.toggle('is-pinned', e.intersectionRatio < 1),
      {
        rootMargin: '0px 0px 100000px 0px',
        threshold: [1],
      }
    );
    observer.observe(caption.current as Element);
  }, []);

  return (
    <table className="projektliste">
      <caption ref={caption}>
        <span className="caption-flexbox">
          <span className="caption-text">
            {props.expandHeadline && <span className="expand">{props.expandHeadline}:&nbsp;</span>}
            {props.children}
            <span className="projektzahl"> ({props.rows.length})</span>
          </span>
          <span className="collapse-link">
            <button type="button" onClick={e => collapseTable(e)}>
              Einklappen
            </button>
          </span>
        </span>
      </caption>
      <thead>
        <tr>
          {props.columns.map(column => {
            return (
              <th scope="col" key={column}>
                {column}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {props.rows.map(cells => {
          return (
            <tr key={cells[0].value as string}>
              {cells.map((cell, i) => {
                return (
                  <td className={cell.class} key={i}>
                    {cell.value}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default TabelleGeruest;
