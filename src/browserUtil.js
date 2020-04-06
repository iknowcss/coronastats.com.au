export const getCookies = () => document.cookie.toString()
  .split('; ')
  .reduce((cookies, c) => {
    const [key, value] = c.split('=');
    cookies[key] = value;
    return cookies;
  }, {});

export function createElement(tag, attributes = {}, children) {
  const el = document.createElement(tag);
  Object.keys(attributes).forEach(_attr => {
    const attr = _attr === 'className' ? 'class' : _attr;
    el.setAttribute(attr, attributes[_attr]);
  });
  if (children) {
    if (typeof children === 'string') {
      el.innerText = children;
    } else if (Array.isArray(children)) {
      children.forEach(child => {
        el.appendChild(child)
      });
    } else if (children.html) {
      el.innerHTML = children.html;
    } else {
      el.appendChild(children);
    }
  }
  return el;
}

export const padLeft = (c, len, str) =>
  Array.from({ length: len - str.toString().length }, () => c).join('') + str;

export const datePad = padLeft.bind(null, '0', 2);
