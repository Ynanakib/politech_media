export function setCookie(key = "", value = "", days = 7){
    let aes = initCrypt();
    key = "pnipu_"+key
    const expires = new Date(Date.now() + days * 864e5).toUTCString(); // срок действия в днях
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(aes.encryptText(value, process.env.VUE_APP_SECRET_CODE)   )}; expires=${expires}; path=/`;
}

export function getCookie(key) {
    let aes = initCrypt();
    key = "pnipu_"+key
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [k, v] = cookie.split("=");
        if (decodeURIComponent(k) === key) {
            let returner = aes.decryptText(decodeURIComponent(v), process.env.VUE_APP_SECRET_CODE);
            return returner
        }
    }
    return null;
}

export function clearCookie() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
}
export function jsonToFormData(jsonObject) {
  const formData = new FormData();
  for (const key in jsonObject) {
    if (Object.prototype.hasOwnProperty.call(jsonObject, key)) {
      const value = jsonObject[key];
      if (typeof value === 'object' && value !== null && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  }
  return formData;
}

function initCrypt() {
    require("pidcrypt/seedrandom")
    require("pidcrypt/aes_cbc")
    let pidCrypt = require("pidcrypt")
    let aes = new pidCrypt.AES.CBC()
    return aes;
}