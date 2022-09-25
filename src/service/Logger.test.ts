import Logger from './Logger';

beforeEach(() => Logger.reset());

test('Grundfunktionen des Loggers', () => {
  Logger.error('Fehlernachricht');
  Logger.error('zweiter Fehler');

  expect(Logger.log.length).toBe(2);
  expect(Logger.log[1]['level']).toBe('error');
  expect(Logger.log[0]['message']).toBe('Fehlernachricht');
  expect(Logger.counter.error).toBe(2);
  expect(Logger.counter.info).not.toBeGreaterThan(0);
});

test('`reset` setzt die Counter auf 0', () => {
  Logger.error('Fehler1');
  Logger.error('Fehler2');
  Logger.info('Info1');
  Logger.info('Info2');
  Logger.info('Info3');
  Logger.debug('Debug');

  Logger.reset();

  expect(Logger.counter.error).toBe(0);
  expect(Logger.counter.debug).toBe(0);
  expect(Logger.counter.info).toBe(0);

  expect(Logger.log.length).toBe(0);
});
