import React, { useRef } from 'react';
import { readKeyPairFromFile, importKeyPairFromJson } from '../../../utils/AES-GSM/key-export-import';
import './missing-private-key.css';
import { fetchRsaPublicKey } from '../../../api/rsa-key';
import Cookies from 'js-cookie';

interface Props {
  onKeyImported: (privateKey: CryptoKey, publicKey: CryptoKey) => void;
}

const MissingPrivateKeyModal: React.FC<Props> = ({ onKeyImported }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const userId = parseInt(Cookies.get('userId') || '0');
    const file = event.target.files?.[0];

    if (!file) return;
    if (file.type !== 'application/json') {
      alert('Veuillez importer un fichier JSON valide.');
      return;
    }

    try {
      const json = await readKeyPairFromFile(file);
      const { privateKey, publicKey } = await importKeyPairFromJson(json);

      // check if the keys are valid
      if (!privateKey || !publicKey) {
        alert("Erreur lors de l'importation : clé privée ou publique manquante.");
        return;
      }

      const { rsa_public_key } = await fetchRsaPublicKey(userId)

      if( rsa_public_key !== json.publicKey) {
        alert("Erreur : la clé publique importée ne correspond pas à celle du serveur.");
        return;
      }

      localStorage.setItem(`privateKey_${userId}`, json.privateKey);

      onKeyImported(privateKey, publicKey);
    } catch (err) {
      alert("Erreur lors de l'importation : fichier invalide.");
      console.error(err);
    }
  };

  return (
    <div className='modal-overlay'>
      <div className='modal'>
        <h2>Clé privée manquante</h2>
        <p>
          Votre clé privée est introuvable. Veuillez importer le fichier .json
          que vous avez sauvegardé lors de votre inscription pour restaurer votre identité.
        </p>

        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileImport}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className='import-button'
        >
          Importer ma clé privée (.json)
        </button>
      </div>
    </div>
  );
};

export default MissingPrivateKeyModal;
