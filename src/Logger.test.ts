import Logger from './Logger';

test('eins', () => {
    Logger.error('Fehlernachricht');

    expect(Logger.log.length).toBe(1);
    expect(Logger.log[0]['level']).toBe('error');
    expect(Logger.log[0]['message']).toBe('Fehlernachricht');
    expect(Logger.counter.error).toBeGreaterThan(0);
    expect(Logger.counter.info).not.toBeGreaterThan(0);
});
