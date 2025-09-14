
import encryptionArt from '@/assets/encryption-art.png';

const EncryptionArt = () => {
  return (
    <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
      <img 
        src={encryptionArt} 
        alt="Military-Grade Encryption Illustration" 
        className="max-w-full max-h-full object-contain drop-shadow-lg"
      />
    </div>
  );
};

export default EncryptionArt;
