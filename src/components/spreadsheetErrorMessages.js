import { ErrorCard } from './errorCard'
import styles from '../../styles/spreadsheetErrorMessages.module.css'

export const SpreadsheetErrorMessages = ({ errors }) => {
  const errorCards =
    errors?.map((error, index) => <ErrorCard key={index} error={error} />) ||
    null

  return !errorCards ? null : (
    <div>
      <div>
        <label>Erros</label>
      </div>

      <div className={styles.cards}>{errorCards}</div>
    </div>
  )
}
