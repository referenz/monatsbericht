type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

type Entry = {
  level: Level;
  time: Date;
  message: string;
};

type ProductionLevels = Extract<Level, 'fatal' | 'error' | 'warn' | 'info'>;
const visibleInProduction: ProductionLevels[] = ['fatal', 'error', 'warn', 'info'];
const visibleInDevelopment: Exclude<Level, ProductionLevels>[] = ['debug'];

export let visible: Level[] = visibleInProduction;
if (process.env.NODE_ENV === 'development') visible = [...visible, ...visibleInDevelopment];

const Logger = {
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

export default Logger;
