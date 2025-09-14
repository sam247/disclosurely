
import secureMessagingArt from '@/assets/secure-messaging-art.png';

const SecureMessagingArt = () => {
  return (
    <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
      <img 
        src={secureMessagingArt} 
        alt="Secure Two-Way Communication Illustration" 
        className="max-w-full max-h-full object-contain drop-shadow-lg"
      />
    </div>
  );
};

export default SecureMessagingArt;
