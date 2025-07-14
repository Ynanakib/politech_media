import CryptoJS from "crypto-js";

class CookieStorage {
    static set(key = "", value = "", hours = 1) {
        key = "pnipu_" + key;
        const expires = new Date(Date.now() + hours * 36e5).toUTCString();
        const secret = process.env.VUE_APP_SECRET_CODE || "default_secret";
        const encrypted = CryptoJS.AES.encrypt(String(value), secret).toString();
        document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(encrypted)}; expires=${expires}; path=/`;
    }

    static get(key) {
        key = "pnipu_" + key;
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

    static remove(key) {
        key = "pnipu_" + key;
        document.cookie = encodeURIComponent(key) + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    static clear() {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
    }
}

class LocalStorage {
    static set(key = "", value = "", hours = 1) {
        key = "pnipu_" + key;
        const secret = process.env.VUE_APP_SECRET_CODE || "default_secret";
        const encrypted = CryptoJS.AES.encrypt(String(value), secret).toString();
        const expires = Date.now() + hours * 36e5;
        localStorage.setItem(key, JSON.stringify({ value: encrypted, expires }));
    }

    static get(key) {
        key = "pnipu_" + key;
        const secret = process.env.VUE_APP_SECRET_CODE || "default_secret";
        const item = localStorage.getItem(key);
        if (!item) return null;
        try {
            const { value, expires } = JSON.parse(item);
            if (expires && Date.now() > expires) {
                localStorage.removeItem(key);
                return null;
            }
            const bytes = CryptoJS.AES.decrypt(value, secret);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            return decrypted;
        } catch (e) {
            return null;
        }
    }

    static remove(key) {
        key = "pnipu_" + key;
        localStorage.removeItem(key);
    }

    static clear() {
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("pnipu_")) {
                localStorage.removeItem(key);
            }
        });
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

export { CookieStorage, LocalStorage };