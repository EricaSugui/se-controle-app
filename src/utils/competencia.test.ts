import { describe, expect, it } from '@jest/globals';
import { intervaloDaCompetencia } from './competencia';

describe('intervaloDaCompetencia', () => {
  it('vai do primeiro ao último dia do mês', () => {
    expect(intervaloDaCompetencia('NOV-26')).toEqual({ de: '2026-11-01', ate: '2026-11-30' });
    expect(intervaloDaCompetencia('DEZ-26')).toEqual({ de: '2026-12-01', ate: '2026-12-31' });
  });

  it('respeita fevereiro, inclusive bissexto', () => {
    expect(intervaloDaCompetencia('FEV-27')).toEqual({ de: '2027-02-01', ate: '2027-02-28' });
    expect(intervaloDaCompetencia('FEV-28')).toEqual({ de: '2028-02-01', ate: '2028-02-29' });
  });
});
