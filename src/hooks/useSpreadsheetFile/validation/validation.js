import { isEmpty, pipe, curry, reduce, isNil, omit } from 'ramda'

export const rules = curry((path, validations, value) =>
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

export const validate = (schema, obj) => {
  return Object.keys(obj).map((objProp) => {
    const validate = schema[objProp]
    const value = obj[objProp]
    return validate(value)
  })
}
