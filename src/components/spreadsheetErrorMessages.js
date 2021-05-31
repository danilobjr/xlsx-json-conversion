import { ErrorCard } from './errorCard'
import styles from '../../styles/spreadsheetErrorMessages.module.css'
import { isEmpty } from 'ramda'

export const SpreadsheetErrorMessages = ({ errors }) => {
  const headerErrorCards =
    errors?.headers?.map((error, index) => <span key={index}>{error}</span>) ||
    null

  const cellErrorCards =
    errors?.cells?.map((error, index) => (
      <ErrorCard key={index} error={error} />
    )) || null

  return isEmpty(errors?.headers) && isEmpty(!errors?.cells) ? null : (
    <div>
      <h3>Erros</h3>

      {!isEmpty(errors?.headers) && (
        <>
          <div>
            <label>Cabecalhos</label>
          </div>
          <div className={styles.cards}>{headerErrorCards}</div>
        </>
      )}

      {!isEmpty(errors?.cells) && (
        <>
          <div>
            <label>Celulas</label>
          </div>
          <div className={styles.cards}>{cellErrorCards}</div>
        </>
      )}
    </div>
  )
}
