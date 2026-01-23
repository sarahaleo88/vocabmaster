/**
 * DOM helper utilities
 */

function el(tag, { className = '', text = '', attrs = {} } = {}) {
  const node = document.createElement(tag);

  if (className) {
    node.className = className;
  }

  node.textContent = String(text ?? '');

  if (attrs && typeof attrs === 'object') {
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        node.setAttribute(key, String(value));
      }
    });
  }

  return node;
}

function setText(node, text) {
  if (!node) return;
  node.textContent = String(text ?? '');
}

export { el, setText };
