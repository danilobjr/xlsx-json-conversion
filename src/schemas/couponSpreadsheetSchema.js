import {
  rules,
  required,
  string,
  stringMax,
  matches,
  number,
  numberRange,
  numberMin,
  integer,
  date,
  dateMin,
} from '../hooks/useSpreadsheetFile'

export const headerToPropMapping = {
  'CODIGO DO CUPOM': 'couponCode',
  QUANTIDADE: 'quantity',
  'DESCONTO NA MENSALIDADE (%)': 'installmentDiscountPercentage',
  'DESCONTO NA ADESAO (%)': 'registrationFeeDiscountPercentage',
  'LIVRE DE CARENCIA (SIM/NAO)': 'freeGracePeriod',
  'DURACAO (MESES)': 'duration',
  // 'DATA DE EXPIRACAO (DD/MM/YYYY)': 'redeemExpirationDate',
  'PLANO (TRIMESTRAL/SEMESTRAL/ANUAL)': 'planName',
  'TIPO DE PLANO (INDIVIDUAL/FAMILIAR)': 'planType',
}

// TODO remove first arg from validation function
export const couponSpreadsheetSchema = {
  couponCode: rules('A', [required({}), string({}), stringMax({ max: 80 })]),
  quantity: rules('B', [
    required({}),
    number({}),
    integer({}),
    numberRange({ min: 1, max: 99999 }),
  ]),
  installmentDiscountPercentage: rules('C', [
    required({}),
    number({}),
    integer({}),
    numberRange({ min: 0, max: 100 }),
  ]),
  registrationFeeDiscountPercentage: rules('D', [
    required({}),
    number({}),
    integer({}),
    numberRange({ min: 0, max: 100 }),
  ]),
  freeGracePeriod: rules('E', [
    required({}),
    string({}),
    matches({
      pattern: /^(sim|n(a|ã)o)$/i,
      errorMessage: 'Valor deveria ser Sim ou Não',
    }),
  ]),
  duration: rules('F', [
    required({}),
    number({}),
    integer({}),
    numberMin({ min: 1 }),
  ]),
  // redeemExpirationDate: rules('G', [
  //   required({}),
  //   date({}),
  //   dateMin({ min: today() }),
  // ]),
  planName: rules('H', [
    required({}),
    string({}),
    matches({
      pattern: /^trimestral|semestral|anual$/i,
      errorMessage: 'Valor deveria ser Trimestral, Semestral ou Anual',
    }),
  ]),
  // ,
  planType: rules('I', [
    required({}),
    string({}),
    matches({
      pattern: /^individual$|^fam(i|í)lia$/i,
      errorMessage: 'Valor deveria ser Individual ou Familia',
    }),
  ]),
}
