import { useEffect, useState } from 'react'
import readXlsxFile from 'read-excel-file'

export const useSpreadsheetFileWithSchemaValidation = ({ schema }) => {
  const [spreadsheetFile, setSpreadsheetFile] = useState(null)
  const [errors, setErrors] = useState(null)

  useEffect(async () => {
    if (!spreadsheetFile) {
      return
    }

    const result = await readXlsxFile(spreadsheetFile, { schema })

    setErrors(result?.errors)

    console.log('useSpreadsheetFileWithSchemaValidation', result)
  }, [spreadsheetFile])

  return {
    setSpreadsheetFile,
    errors,
  }
}
