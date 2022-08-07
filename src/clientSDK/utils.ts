export function isString(x: unknown): x is string {
  return typeof x === 'string' || x instanceof String
}
export function isBoolean(x: unknown): x is boolean {
  return typeof x === 'boolean' || x instanceof Boolean
}
export const IsDefinedNotNull = <T>(data: any): data is T => {
  return data !== undefined && data !== null
}

export const IsObjectEmpty = (obj: Record<string, unknown>) => {
  if (Object.keys(obj).length === 0) {
    return true
  } else {
    let isEmpty = true
    for (const key of Object.keys(obj)) {
      if (IsDefinedNotNull((obj as any)[key])) {
        isEmpty = false
        break
      }
    }
    if (isEmpty) {
      return true
    } else {
      return false
    }
  }
}
