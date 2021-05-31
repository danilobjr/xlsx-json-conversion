import { head, path, pipe } from 'ramda'
import { couponSpreadsheetSchema } from '../src/schemas'
import { SpreadsheetErrorMessages } from '../src/components'
import { useSpreadsheetFileWithSchemaValidation } from '../src/hooks'
import styles from '../styles/index.module.css'

const Index = () => {
  const { setSpreadsheetFile, errors } =
    useSpreadsheetFileWithSchemaValidation()

  const onInputChange = pipe(
    path(['target', 'files']),
    head,
    setSpreadsheetFile,
  )

  return (
    <div className={styles.container}>
      <div>
        <a className={styles.anchor} href="/ajuda-saude-cupom-template.xlsx">
          Download template
        </a>
      </div>

      <div className={styles.inputfield}>
        <div>
          <label>Planilha</label>
        </div>
        <input type="file" onChange={onInputChange} />
      </div>

      <div className={styles.mtop}>
        <SpreadsheetErrorMessages errors={errors} />
      </div>
    </div>
  )
}

export default Index
