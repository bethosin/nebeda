function logEmailWarning(response, context) {
  if (import.meta.env.DEV && response?.emailWarning) {
    console.warn(`[Email diagnostic] ${context}: ${response.emailWarning}`)
  }
}

export default logEmailWarning
