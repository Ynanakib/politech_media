import CryptoJS from "crypto-js";

export function setCookie(key = "", value = "", hours = 1) {
    key = "pnipu_"+key
    const expires = new Date(Date.now() + hours * 36e5 ).toUTCString(); // срок действия в днях
    const secret = process.env.VUE_APP_SECRET_CODE || "default_secret";
    const encrypted = CryptoJS.AES.encrypt(String(value), secret).toString();
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(encrypted)}; expires=${expires}; path=/`;
}

export function getCookie(key) {
    key = "pnipu_"+key
    const secret = process.env.VUE_APP_SECRET_CODE || "default_secret";
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [k, v] = cookie.split("=");
        if (decodeURIComponent(k) === key) {
            try {
                const bytes = CryptoJS.AES.decrypt(decodeURIComponent(v), secret);
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                return decrypted;
            } catch (e) {
                return null;
            }
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

export function removeCookie(key) {
    key = "pnipu_" + key;
    document.cookie = encodeURIComponent(key) + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}