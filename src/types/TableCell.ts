import { ReactNode } from 'react';

type TableCell = {
    column: string;
    class: string;
    value: string | ReactNode;
};

export default TableCell;
