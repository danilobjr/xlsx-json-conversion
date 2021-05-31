import styles from '../../styles/errorCard.module.css'

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

// function getCellByError(error) {
//   return `${getExcelColumnInLetterFormatByColumnName(error?.column)}${
//     error?.row
//   }`
// }

export const ErrorCard = ({ error, ...otherProps }) => (
  <div className={styles.card} {...otherProps}>
    <h2>
      <strong>{error?.cell}</strong>
    </h2>

    <p>
      {'Erro: '}
      <strong>{error?.errorMessage}</strong>
    </p>

    {'Conteudo: '}
    <strong>{error?.value || 'Vazio'}</strong>
  </div>
)
