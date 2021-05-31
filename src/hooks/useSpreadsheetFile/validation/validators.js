import {
  allPass,
  isEmpty,
  pipe,
  curry,
  length,
  gte,
  lte,
  not,
  anyPass,
  isNil,
  is,
} from 'ramda'

export const required = curry(
  ({ errorMessage = 'Informe um valor' }, value) => ({
    valid: pipe(anyPass([isEmpty, isNil]), not)(value),
    errorMessage,
    value,
  }),
)

export const string = curry(
  ({ errorMessage = 'Valor nao eh do tipo texto' }, value) => ({
    valid: is(String)(value),
    errorMessage,
    value,
  }),
)

export const stringMax = curry(
  ({ max, errorMessage = `Valor com no maximo ${max} caracteres` }, value) => ({
    valid: pipe(length, gte(max))(value),
    errorMessage,
    value,
  }),
)

export const matches = curry(
  (
    { pattern, errorMessage = `Valor nao satisfaz padrao: ${pattern}` },
    value,
  ) => {
    return {
      valid: pattern?.test(value),
      errorMessage,
      value,
    }
  },
)

export const number = curry(
  ({ errorMessage = 'Valor nao eh numerico' }, value) => ({
    valid: is(Number)(value),
    errorMessage,
    value,
  }),
)

export const integer = curry(
  ({ errorMessage = 'Valor numerico deve ser do tipo inteiro' }, value) => ({
    valid: Number.isInteger(value),
    errorMessage,
    value,
  }),
)

export const numberMin = curry(
  (
    { min, errorMessage = `Valor deve ser maior ou igual a ${min}` },
    value,
  ) => ({
    valid: lte(min)(value),
    errorMessage,
    value,
  }),
)

export const numberMax = curry(
  (
    { max, errorMessage = `Valor deve ser menor ou igual a ${max}` },
    value,
  ) => ({
    valid: gte(max)(value),
    errorMessage,
    value,
  }),
)

export const numberRange = curry(
  (
    {
      min,
      max,
      errorMessage = `Valor deve estar no intervalo de ${min} a ${max}`,
    },
    value,
  ) => ({
    valid: allPass([lte(min), gte(max)])(value),
    errorMessage,
    value,
  }),
)

export const date = curry(
  ({ errorMessage = 'Valor nao eh uma data valida' }, value) => ({
    valid: validator.isDate(value, { format: 'DD/MM/YYYY' }),
    errorMessage,
    value,
  }),
)

export const dateMin = curry(
  (
    {
      min,
      errorMessage = `Data deve ser maior ou igual a ${
        typeof min === 'string' ? min : min?.toLocaleDateString('pt-br')
      }`,
    },
    value,
  ) => {
    return {
      valid: lte(min)(DateTime.fromFormat(value, 'dd/MM/yyyy')),
      errorMessage,
      value,
    }
  },
)
