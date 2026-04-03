// Polyfill for crypto.randomUUID in non-secure contexts (HTTP)
// Firefox and some other browsers don't provide crypto.randomUUID in non-secure contexts
if (typeof crypto !== "undefined" && !crypto.randomUUID) {
  crypto.randomUUID = function randomUUID(): string {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => {
      const num = parseInt(c, 10);
      const randomBits = (crypto.getRandomValues
        ? crypto.getRandomValues(new Uint8Array(1))[0]
        : Math.floor(Math.random() * 256)) &
        (0xf >> (num / 4));
      return (num ^ randomBits).toString(16);
    });
  };
}

// Polyfill for Object.hasOwn (ES2022)
// Required for browsers that don't support Object.hasOwn natively (e.g., some Edge versions)
if (!Object.hasOwn) {
  Object.hasOwn = function <T extends object>(obj: T, prop: keyof T): boolean {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };
}

export {};
