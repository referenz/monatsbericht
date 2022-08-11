function cellClassName(column: string) {
    return column.replaceAll(' ', '-').replaceAll('.', '').toLowerCase();
}

export default cellClassName;
