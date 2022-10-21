type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface Entry {
  level: Level;
  time: Date;
  message: string;
}

const visibleInProduction: Exclude<Level, 'debug'>[] = ['info', 'warn', 'error', 'fatal'];
const visibleInDevelopment: Extract<Level, 'debug'>[] = ['debug'];

export let visible: Level[] = visibleInProduction;
if (import.meta.env.DEV) visible = [...visible, ...visibleInDevelopment];

const logger = {
  log: [] as Entry[],

  counter: {
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
    fatal: 0,
  },

  countVisibleMsgs() {
    let visibleCounter = 0;
    for (const level of ['debug', 'info', 'warn', 'error', 'fatal'] as Level[]) {
      if (visible.includes(level)) visibleCounter += this.counter[level];
    }
    return visibleCounter;
  },

  get hasVisibleMsg() {
    return this.countVisibleMsgs() > 0;
  },

  get hasFatalMsg() {
    return this.counter.fatal > 0;
  },

  reset() {
    for (const prop in this.counter) {
      this.counter[prop as keyof typeof this.counter] = 0;
    }
    this.log = [];
  },

  newEntry(level: Level, msg: string) {
    const entry: Entry = {
      level: level,
      time: new Date(),
      message: msg,
    };
    this.log.push(entry);
    this.counter[level]++;
  },

  debug(msg: string) {
    this.newEntry('debug', msg);
  },

  info(msg: string) {
    this.newEntry('info', msg);
  },

  warn(msg: string) {
    this.newEntry('warn', msg);
  },

  error(msg: string) {
    this.newEntry('error', msg);
  },

  fatal(msg: string) {
    this.newEntry('fatal', msg);
  },
};

export default logger;
