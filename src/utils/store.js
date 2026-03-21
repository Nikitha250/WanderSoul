// Simple global store — no Redux needed
let _personaResult = null;

export function setPersonaResult(result) {
  _personaResult = result;
}

export function getPersonaResult() {
  return _personaResult;
}