
const EncryptionArt = () => {
  return (
    <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
      <svg width="200" height="160" viewBox="0 0 200 160" className="drop-shadow-lg">
        {/* Lock body */}
        <rect
          x="70"
          y="90"
          width="60"
          height="50"
          rx="8"
          fill="#1E40AF"
          opacity="0.9"
        />
        
        {/* Lock shackle */}
        <path
          d="M85 90 L85 70 C85 58 92 50 100 50 C108 50 115 58 115 70 L115 90"
          stroke="#1E40AF"
          strokeWidth="8"
          fill="none"
          opacity="0.9"
        />
        
        {/* Keyhole */}
        <circle cx="100" cy="110" r="6" fill="white" />
        <rect x="97" y="110" width="6" height="12" fill="white" />
        
        {/* Encryption symbols around lock */}
        <g fill="#3B82F6" opacity="0.6" className="text-sm font-mono">
          <text x="40" y="50">01</text>
          <text x="150" y="50">10</text>
          <text x="35" y="80">11</text>
          <text x="155" y="80">00</text>
          <text x="40" y="120">10</text>
          <text x="150" y="120">01</text>
          <text x="35" y="150">11</text>
          <text x="155" y="150">10</text>
        </g>
        
        {/* Encryption lines */}
        <g stroke="#3B82F6" strokeWidth="1" opacity="0.4">
          <line x1="20" y1="60" x2="60" y2="80" />
          <line x1="140" y1="80" x2="180" y2="60" />
          <line x1="20" y1="100" x2="60" y2="120" />
          <line x1="140" y1="120" x2="180" y2="100" />
        </g>
      </svg>
    </div>
  );
};

export default EncryptionArt;
