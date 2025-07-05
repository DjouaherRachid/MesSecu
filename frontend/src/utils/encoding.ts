export function toBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

// Copie fiable pour éviter SharedArrayBuffer
export function toArrayBuffer(uint8: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(uint8.byteLength);
  new Uint8Array(buffer).set(uint8);
  return buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

export function binaryStringToUint8Array(binaryStr: string): Uint8Array {
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i) & 0xff;
  }
  return bytes;
}

export function uint8ArrayToBase64(bytes: number[]): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary); // btoa est une fonction native navigateur pour base64
}

export function fixBase64(str: string): string {
  str = str.replace(/[^A-Za-z0-9+/]/g, ''); // Supprime les caractères invalides
  while (str.length % 4 !== 0) {
    str += '=';
  }
  return str;
}

export function base64ToArrayBuffer(label: string, base64: string): ArrayBuffer {
  const fixed = fixBase64(base64);

  try {
    const binaryString = window.atob(fixed);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (err) {
    throw new Error(`Erreur de décodage Base64 pour ${label}`);
  }
}

export const ensureArrayBuffer = (input: any) => {
  if (input instanceof ArrayBuffer) {
    return input;
  }

  if (input instanceof Uint8Array) {
      if (input.buffer instanceof ArrayBuffer) {
      }else {
      }
    return input.buffer;
  }

  if (typeof SharedArrayBuffer !== 'undefined' && input instanceof SharedArrayBuffer) {
    throw new Error('SharedArrayBuffer non supporté');
  }

  throw new Error('Input must be ArrayBuffer or Uint8Array');
};

export function uint8ArrayToArrayBuffer(arr: Uint8Array): ArrayBuffer {
    return (arr.buffer.slice(arr.byteOffset, arr.byteLength + arr.byteOffset) as ArrayBuffer);
}