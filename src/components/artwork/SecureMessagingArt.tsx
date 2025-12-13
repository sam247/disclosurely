
const SecureMessagingArt = () => {
  return (
    <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
      <svg width="200" height="160" viewBox="0 0 200 160" className="drop-shadow-lg">
        {/* Left message bubble */}
        <path
          d="M30 50 L120 50 Q130 50 130 60 L130 85 Q130 95 120 95 L50 95 L30 110 Z"
          fill="#1E40AF"
          opacity="0.8"
        />
        
        {/* Right message bubble */}
        <path
          d="M70 80 L160 80 Q170 80 170 90 L170 115 Q170 125 160 125 L150 125 L170 140 L90 125 Q70 125 70 115 Z"
          fill="#3B82F6"
          opacity="0.9"
        />
        
        {/* Shield overlays on bubbles */}
        <g fill="white" opacity="0.9">
          {/* Left shield */}
          <path d="M80 60 L95 65 L95 85 C95 88 90 90 80 90 C70 90 65 88 65 85 L65 65 Z" />
          
          {/* Right shield */}
          <path d="M120 90 L135 95 L135 115 C135 118 130 120 120 120 C110 120 105 118 105 115 L105 95 Z" />
        </g>
        
        {/* Connecting secure line */}
        <g stroke="#1E40AF" strokeWidth="2" opacity="0.6" strokeDasharray="5,5">
          <line x1="130" y1="72" x2="70" y2="88" />
        </g>
        
        {/* Lock icons */}
        <g fill="#1E40AF" opacity="0.7">
          <rect x="76" y="70" width="8" height="6" rx="1" />
          <path d="M78 70 L78 67 C78 66 79 65 80 65 C81 65 82 66 82 67 L82 70" stroke="#1E40AF" strokeWidth="1" fill="none" />
          
          <rect x="116" y="100" width="8" height="6" rx="1" />
          <path d="M118 100 L118 97 C118 96 119 95 120 95 C121 95 122 96 122 97 L122 100" stroke="#1E40AF" strokeWidth="1" fill="none" />
        </g>
      </svg>
    </div>
  );
};

export default SecureMessagingArt;
