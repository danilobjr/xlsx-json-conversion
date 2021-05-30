import { head, includes, isEmpty, pipe, map, find, values, nth } from 'ramda'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import * as yup from 'yup'

const convertNumberToAlphabetLetter = (number) =>
  String.fromCharCode(number + 64)

const expectedHeaders = [
  'CODIGO DO CUPOM',
  'QUANTIDADE',
  'DESCONTO NA MENSALIDADE (%)',
  'DESCONTO NA ADESAO (%)',
  'LIVRE DE CARENCIA',
  'DURACAO (MESES)',
  'DATA DE EXPIRACAO',
  'PLANO',
  'TIPO DE PLANO',
]

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
  'LIVRE DE CARENCIA': { propName: 'freeGracePeriod', column: 5 },
  'DURACAO (MESES)': { propName: 'duration', column: 6 },
  'DATA DE EXPIRACAO': { propName: 'redeemExpirationDate', column: 7 },
  PLANO: { propName: 'planName', column: 7 },
  'TIPO DE PLANO': { propName: 'planType', column: 8 },
}

const getPropNameFromHeaderMappingByKey = (key) =>
  headerToPropMapping?.[key]?.propName

const getColumnFromHeaderMappingByPropName = (mapping, propName) =>
  pipe(
    values,
    map(values),
    find(includes(propName)),
    nth(1),
    convertNumberToAlphabetLetter,
  )(mapping)

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

const couponSpreadsheetSchema = yup.object().shape({
  couponCode: yup.string().max(80).required(),
  quantity: yup.number().positive().min(1).max(99999).required(),
  installmentDiscountPercentage: yup
    .number()
    .integer()
    .min(0)
    .max(100)
    .required(),
  registrationFeeDiscountPercentage: yup
    .number()
    .integer()
    .min(0)
    .max(100)
    .required(),
  freeGracePeriod: yup
    .string()
    .matches(/^(sim|n(a|ã)o)$/gi, 'Valor deveria ser Sim ou Nao')
    .required(),
  duration: yup.number().integer().min(1, 'Valor minimo eh 1').required(),
  redeemExpirationDate: yup
    // TODO set a transformation to dd/MM/yyyy
    .date()
    .min(new Date(), 'Data nao pode ser definida no passado')
    .required(),
  planName: yup
    .string()
    .matches(
      /^trimestral$|^semestral$|^anual$/gi,
      'Valor deveria ser Trimestral, Semestral ou Anual',
    )
    .required(),
  planType: yup
    .string()
    .matches(
      /^individual$|^fam(i|í)lia$/gi,
      'Valor deveria ser Individual ou Familia',
    )
    .required(),
})

const validateRow = (schema) => (row, rowNumber) => {
  try {
    schema.validateSync(row, { abortEarly: false })
    return
  } catch (error) {
    const getColumnLetter = (e) =>
      getColumnFromHeaderMappingByPropName(headerToPropMapping, e?.path)

    const getColumn = (e) => `${getColumnLetter(e)}${rowNumber}`

    return error?.inner?.map((e) => ({
      column: getColumn(e),
      value: e?.params?.originalValue,
      message: e?.message,
    }))
  }
}

const validateRows = (rowsCandidate, validate) => {
  return rowsCandidate?.reduce((errors, row, index) => {
    const skipZeroBasedIndexAndHeadersIndex = 2
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

    const rowsValidationResult = validateRows(
      rows,
      validateRow(couponSpreadsheetSchema),
    )

    setErrors({
      headers: headersValidationResult,
      rows: rowsValidationResult,
    })
  }, [spreadsheetFile])

  return {
    setSpreadsheetFile,
    errors,
  }
}
