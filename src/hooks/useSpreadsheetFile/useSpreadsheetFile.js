import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import {
  head,
  includes,
  isEmpty,
  pipe,
  map,
  keys,
  not,
  isNil,
  filter,
} from 'ramda'
import { headerToPropMapping } from '../../schemas'

const convertNumberToAlphabetLetter = (number) =>
  String.fromCharCode(number + 64)

const expectedHeaders = keys(headerToPropMapping)

const getPropNameFromHeaderMappingByKey = (key) => headerToPropMapping?.[key]

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
