import {
  allPass,
  head,
  includes,
  isEmpty,
  pipe,
  map,
  keys,
  curry,
  reduce,
  length,
  gte,
  lte,
  not,
  anyPass,
  isNil,
  is,
  omit,
  filter,
} from 'ramda'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import validator from 'validator'
import { DateTime } from 'luxon'

const today = () => new Date(new Date().setHours(0, 0, 0))

const required = curry(({ errorMessage = 'Informe um valor' }, value) => ({
  valid: pipe(anyPass([isEmpty, isNil]), not)(value),
  errorMessage,
  value,
}))

const string = curry(
  ({ errorMessage = 'Valor nao eh do tipo texto' }, value) => ({
    valid: is(String)(value),
    errorMessage,
    value,
  }),
)

const stringMax = curry(
  ({ max, errorMessage = `Valor com no maximo ${max} caracteres` }, value) => ({
    valid: pipe(length, gte(max))(value),
    errorMessage,
    value,
  }),
)

const matches = curry(
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

const number = curry(({ errorMessage = 'Valor nao eh numerico' }, value) => ({
  valid: is(Number)(value),
  errorMessage,
  value,
}))

const integer = curry(
  ({ errorMessage = 'Valor numerico deve ser do tipo inteiro' }, value) => ({
    valid: Number.isInteger(value),
    errorMessage,
    value,
  }),
)

const numberMin = curry(
  (
    { min, errorMessage = `Valor deve ser maior ou igual a ${min}` },
    value,
  ) => ({
    valid: lte(min)(value),
    errorMessage,
    value,
  }),
)

const numberMax = curry(
  (
    { max, errorMessage = `Valor deve ser menor ou igual a ${max}` },
    value,
  ) => ({
    valid: gte(max)(value),
    errorMessage,
    value,
  }),
)

const numberRange = curry(
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

const date = curry(
  ({ errorMessage = 'Valor nao eh uma data valida' }, value) => ({
    valid: validator.isDate(value, { format: 'DD/MM/YYYY' }),
    errorMessage,
    value,
  }),
)

const dateMin = curry(
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

const log = (x) => {
  console.log('log', x)
  return x
}

const validation = curry((path, validations, value) =>
  pipe(
    reduce((validationResult, validate) => {
      if (!isEmpty(validationResult)) {
        return validationResult
      }

      const result = validate(value)
      if (!result.valid) {
        return [result]
      }

      return validationResult
    }, []),
    reduce((error, validationResult) => {
      if (isNil(error) && !validationResult.valid) {
        return {
          ...omit(['valid'])(validationResult),
          path,
        }
      }

      return error
    }, undefined),
  )(validations),
)

const validate = (schema, obj) => {
  return Object.keys(obj).map((objProp) => {
    const validate = schema[objProp]
    const value = obj[objProp]
    return validate(value)
  })
}

const convertNumberToAlphabetLetter = (number) =>
  String.fromCharCode(number + 64)

const headerToPropMapping = {
  'CODIGO DO CUPOM': { propName: 'couponCode', column: 1 },
  QUANTIDADE: { propName: 'quantity', column: 2 },
  'DESCONTO NA MENSALIDADE (%)': {
    propName: 'installmentDiscountPercentage',
    column: 3,
  },
  'DESCONTO NA ADESAO (%)': {
    propName: 'registrationFeeDiscountPercentage',
    column: 4,
  },
  'LIVRE DE CARENCIA (SIM/NAO)': { propName: 'freeGracePeriod', column: 5 },
  'DURACAO (MESES)': { propName: 'duration', column: 6 },
  'DATA DE EXPIRACAO (DD/MM/YYYY)': {
    propName: 'redeemExpirationDate',
    column: 7,
  },
  'PLANO (TRIMESTRAL/SEMESTRAL/ANUAL)': { propName: 'planName', column: 7 },
  'TIPO DE PLANO (INDIVIDUAL/FAMILIAR)': { propName: 'planType', column: 8 },
}

const expectedHeaders = keys(headerToPropMapping)

const getPropNameFromHeaderMappingByKey = (key) =>
  headerToPropMapping?.[key]?.propName

// const getColumnFromHeaderMappingByPropName = (mapping, propName) =>
//   pipe(
//     values,
//     map(values),
//     find(includes(propName)),
//     nth(1),
//     convertNumberToAlphabetLetter,
//   )(mapping)

const validateHeaders = (expected, headersCandidate) => {
  return expected.reduce((errors, expectedHeader, index) => {
    const column = index + 1

    const expectedHeaderNotFoundInThisColumn = !includes(
      expectedHeader,
      headersCandidate,
    )
    if (expectedHeaderNotFoundInThisColumn) {
      return [
        ...errors,
        `Cabecalho esperado na coluna ${convertNumberToAlphabetLetter(
          column,
        )}: ${expectedHeader}`,
      ]
    }

    return errors
  }, [])
}

const convertSpreadsheetDataIntoObject = (data, mapping) => {
  const [headers, ...rows] = data

  return rows.map((row) =>
    headers.reduce((obj, header, index) => {
      const column = index
      let prop = header

      if (mapping) {
        prop = getPropNameFromHeaderMappingByKey(header)
      }

      return {
        ...obj,
        [prop]: row[column],
      }
    }, {}),
  )
}

// TODO remove first arg from validation function
const couponSpreadsheetSchema = {
  couponCode: validation('A', [
    required({}),
    string({}),
    stringMax({ max: 80 }),
  ]),
  quantity: validation('B', [
    required({}),
    number({}),
    numberRange({ min: 1, max: 99999 }),
  ]),
  installmentDiscountPercentage: validation('C', [
    required({}),
    number({}),
    numberRange({ min: 0, max: 100 }),
  ]),
  registrationFeeDiscountPercentage: validation('D', [
    required({}),
    number({}),
    numberRange({ min: 0, max: 100 }),
  ]),
  freeGracePeriod: validation('E', [
    required({}),
    string({}),
    matches({
      pattern: /^(sim|n(a|ã)o)$/i,
      errorMessage: 'Valor deveria ser Sim ou Não',
    }),
  ]),
  duration: validation('F', [
    required({}),
    number({}),
    integer({}),
    numberMin({ min: 1 }),
  ]),
  redeemExpirationDate: validation('G', [
    required({}),
    date({}),
    dateMin({ min: today() }),
  ]),
  planName: validation('H', [
    required({}),
    string({}),
    matches({
      pattern: /^trimestral|semestral|anual$/i,
      errorMessage: 'Valor deveria ser Trimestral, Semestral ou Anual',
    }),
  ]),
  // ,
  planType: validation('I', [
    required({}),
    string({}),
    matches({
      pattern: /^individual$|^fam(i|í)lia$/i,
      errorMessage: 'Valor deveria ser Individual ou Familia',
    }),
  ]),
}

const validateRow = (schema) => (row, rowNumber) => {
  const validationResults = validate(schema, row)
  return pipe(
    filter(pipe(isNil, not)),
    map((validationResult) => ({
      cell: `${validationResult.path}${rowNumber}`,
      value: validationResult?.value,
      errorMessage: validationResult?.errorMessage,
    })),
  )(validationResults)
}

const validateRows = (rowsCandidate, validate) => {
  return rowsCandidate?.reduce((errors, row, index) => {
    const skipZeroBasedIndexAndHeadersIndex = 1
    const rowNumber = index + skipZeroBasedIndexAndHeadersIndex
    const rowErrors = validate(row, rowNumber)
    return isEmpty(rowErrors) ? errors : [...errors, ...rowErrors]
  }, [])
}

export const worksheetReaderInit = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e?.target?.result
      const readedData = XLSX.read(data, { type: 'binary' })
      const worksheetName = readedData.SheetNames[0]
      const worksheet = readedData.Sheets[worksheetName]

      const dataParsed = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: true,
        blankrows: false,
      })

      return resolve(dataParsed)
    }

    reader.onerror = reject

    reader.readAsBinaryString(file)
  })
}

export const useSpreadsheetFileWithSchemaValidation = () => {
  const [spreadsheetFile, setSpreadsheetFile] = useState(null)
  const [errors, setErrors] = useState(null)

  useEffect(async () => {
    if (!spreadsheetFile) {
      return
    }

    const spreadsheetData = await worksheetReaderInit(spreadsheetFile)
    const headers = head(spreadsheetData)

    const headersValidationResult = validateHeaders(expectedHeaders, headers)

    const rows = convertSpreadsheetDataIntoObject(
      spreadsheetData,
      headerToPropMapping,
    )

    if (!isEmpty(headersValidationResult)) {
      setErrors({
        headers: headersValidationResult,
      })

      return
    }

    const cellValidationResults = validateRows(
      rows,
      validateRow(couponSpreadsheetSchema),
    )

    setErrors({
      headers: headersValidationResult,
      cells: cellValidationResults,
    })
  }, [spreadsheetFile])

  return {
    setSpreadsheetFile,
    errors,
  }
}
