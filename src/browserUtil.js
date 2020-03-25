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
    } else {
      el.appendChild(children);
    }
  }
  return el;
}
