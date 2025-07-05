/**
 * Exporte une paire de clés RSA au format JSON encodé en base64
 */
export async function exportKeyPairToJson(
  privateKey: CryptoKey,
  publicKey: CryptoKey
): Promise<{ privateKey: string; publicKey: string }> {
  const exportedPrivate = await window.crypto.subtle.exportKey("pkcs8", privateKey);
  const exportedPublic = await window.crypto.subtle.exportKey("spki", publicKey);

  const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPrivate)));
  const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPublic)));

  return {
    privateKey: privateKeyBase64,
    publicKey: publicKeyBase64,
  };
}

/**
 * Importe une paire de clés RSA à partir d’un JSON encodé en base64
 */
export async function importKeyPairFromJson(keyPairJson: {
  privateKey: string;
  publicKey: string;
}): Promise<{ privateKey: CryptoKey; publicKey: CryptoKey }> {
  const privBuffer = Uint8Array.from(
    atob(keyPairJson.privateKey),
    (c) => c.charCodeAt(0)
  );
  const pubBuffer = Uint8Array.from(
    atob(keyPairJson.publicKey),
    (c) => c.charCodeAt(0)
  );

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privBuffer.buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );

  const publicKey = await crypto.subtle.importKey(
    "spki",
    pubBuffer.buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );

  return { privateKey, publicKey };
}

/**
 * Sauvegarde un objet JSON (paire de clés) dans un fichier .json téléchargeable
 */
export function saveKeyPairAsFile(
  keyPairJson: { privateKey: string; publicKey: string },
  filename = "rsa-keypair.json"
) {
  const blob = new Blob([JSON.stringify(keyPairJson, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Lit un fichier .json contenant une paire de clés RSA (format exporté)
 */
export function readKeyPairFromFile(file: File): Promise<{ privateKey: string; publicKey: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === "string") {
          const json = JSON.parse(result);
          if (json.privateKey && json.publicKey) {
            resolve(json);
          } else {
            reject(new Error("Fichier invalide : données manquantes"));
          }
        } else {
          reject(new Error("Fichier vide ou non lisible"));
        }
      } catch (e) {
        reject(e);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
