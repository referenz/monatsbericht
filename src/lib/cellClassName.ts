function cellClassName(column: string) {
    return column.replace(' ', '-').replace('.', '').toLowerCase();
}

export default cellClassName;
