type GlobalState =
    | 'INIT'
    | 'GO_FOR_INIT'
    | 'ONE_FILE'
    | 'PROMPT'
    | 'GO_FOR_ANALYSIS'
    | 'ANALYSIS'
    | 'GO_FOR_SECOND'
    | 'WAIT_FOR_SECOND'
    | 'TWO_FILES'
    | 'COMPARE'
    | 'FATAL_ERROR';
export default GlobalState;
