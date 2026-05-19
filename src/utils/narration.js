export function say(text) {
  return { text, style: 'statement' };
}

export function ask(text) {
  return { text, style: 'question' };
}

export function cheer(text) {
  return { text, style: 'celebration' };
}

export function emphasize(text) {
  return { text, style: 'emphasis' };
}

export function think(text) {
  return { text, style: 'thinking' };
}

export function celebrate(text) {
  return { text, style: 'celebration' };
}
