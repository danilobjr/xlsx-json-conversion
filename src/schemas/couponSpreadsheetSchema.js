import validator from 'validator'

export const couponSpreadsheetSchema = {
  'CODIGO DO CUPOM': {
    prop: 'code',
    type: String,
    required: true,
  },
  QUANTIDADE: {
    prop: 'amount',
    type: Number,
    required: true,
  },
  'DESCONTO NA MENSALIDADE (%)': {
    prop: 'installmentDiscountPercentage',
    type: (value) => {
      if (!validator.isNumeric(String(value))) {
        throw new Error('Valor nao eh do tipo numerico')
      }

      const between0And100 = value >= 0 && value <= 100
      if (!between0And100) {
        throw new Error('Valor aceito vai de 0 a 100')
      }
    },
    required: true,
  },
  'DESCONTO NA ADESAO (%)': {
    prop: 'registrationFeeDiscountPercentage',
    type: (value) => {
      if (!validator.isNumeric(String(value))) {
        throw new Error('Valor nao eh do tipo numerico')
      }

      const between0And100 = value >= 0 && value <= 100
      if (!between0And100) {
        throw new Error('Valor aceito vai de 0 a 100')
      }
    },
    required: true,
  },
  'LIVRE DE CARENCIA': {
    prop: 'freeGracePeriod',
    type: String,
    required: true,
    oneOf: ['sim', 'nao'],
  },
  'DURACAO (MESES)': {
    prop: 'duration',
    type: (value) => {
      if (!validator.isNumeric(String(value))) {
        throw new Error('Valor nao eh do tipo numerico')
      }

      const between0And100 = value >= 0 && value <= 100
      if (!between0And100) {
        throw new Error('Valor minimo eh 0')
      }
    },
    required: true,
  },
  'DATA DE EXPIRACAO': {
    prop: 'redeemExpirationDate',
    type: (value) => {
      const notValidDate = !validator.isDate(value, { format: 'dd/mm/yyyy' })
      if (notValidDate) {
        throw new Error('Formato invalido')
      }

      // TODO validate is this value is in the future

      return value
    },
    required: true,
  },
  PLANO: {
    prop: 'planName',
    type: String,
    required: true,
    oneOf: ['trimestral', 'semestral', 'anual'],
  },
}
