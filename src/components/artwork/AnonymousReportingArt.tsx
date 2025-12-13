
const AnonymousReportingArt = () => {
  return (
    <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
      <svg width="200" height="160" viewBox="0 0 200 160" className="drop-shadow-lg">
        {/* Background shield */}
        <path
          d="M100 20 L160 40 L160 100 C160 120 140 140 100 140 C60 140 40 120 40 100 L40 40 Z"
          fill="#3B82F6"
          opacity="0.1"
        />
        
        {/* Main figure silhouette */}
        <circle cx="100" cy="65" r="18" fill="#1E40AF" opacity="0.8" />
        <path
          d="M100 83 C85 83 75 93 75 105 L75 125 L125 125 L125 105 C125 93 115 83 100 83 Z"
          fill="#1E40AF"
          opacity="0.8"
        />
        
        {/* Question mark overlay */}
        <text
          x="100"
          y="110"
          textAnchor="middle"
          className="fill-white text-2xl font-bold"
        >
          ?
        </text>
        
        {/* Protective lines */}
        <g stroke="#3B82F6" strokeWidth="2" opacity="0.6">
          <line x1="60" y1="45" x2="140" y2="45" />
          <line x1="60" y1="115" x2="140" y2="115" />
          <line x1="65" y1="40" x2="65" y2="120" />
          <line x1="135" y1="40" x2="135" y2="120" />
        </g>
      </svg>
    </div>
  );
};

export default AnonymousReportingArt;
