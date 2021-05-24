import { parseExcelDate } from 'read-excel-file'
import styles from './spreadsheetErrorMessages.module.css'

function getExcelColumnInLetterFormatByColumnName(columnName) {
  switch (columnName) {
    case 'CODIGO DO CUPOM':
      return 'A'
    case 'QUANTIDADE':
      return 'B'
    case 'DESCONTO NA MENSALIDADE (%)':
      return 'C'
    case 'DESCONTO NA ADESAO (%)':
      return 'D'
    case 'LIVRE DE CARENCIA':
      return 'E'
    case 'DURACAO (MESES)':
      return 'F'
    case 'DATA DE EXPIRACAO':
      return 'G'
    case 'PLANO':
      return 'H'
    default:
      throw new Error(`Coluna ${columnName} nao encontrada`)
  }
}

function getCellByError(error) {
  return `${getExcelColumnInLetterFormatByColumnName(error?.column)}${
    error?.row
  }`
}

const ErrorCard = ({ error, ...otherProps }) => {
  let value = error.value

  if (error.type === Date) {
    value = parseExcelDate(value).toString()
  }

  return (
    <div className={styles.card} {...otherProps}>
      <h2>
        {'Celula '}
        <strong>{getCellByError(error)}</strong>
      </h2>

      <p>
        {'Erro: '}
        <strong>{error?.error}</strong>
      </p>

      {'Conteudo: '}
      <strong>{value || 'vazio'}</strong>
    </div>
  )
}

export const SpreadsheetErrorMessages = ({ errors }) => {
  const errorCards =
    errors?.map((error, index) => <ErrorCard key={index} error={error} />) ||
    null

  return (
    <div>
      <div>
        <label>Erros</label>
      </div>
      {errorCards}
    </div>
  )
}
