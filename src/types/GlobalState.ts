type GlobalState =
    | 'INIT'
    | 'ONE_FILE'
    | 'PROMPT'
    | 'GO_FOR_SECOND'
    | 'WAIT_FOR_SECOND'
    | 'TWO_FILES'
    | 'COMPARE'
    | 'ERROR';
export default GlobalState;
