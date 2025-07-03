
const UnlimitedScaleArt = () => {
  return (
    <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
      <svg width="200" height="160" viewBox="0 0 200 160" className="drop-shadow-lg">
        {/* Central infinity symbol */}
        <path
          d="M70 80 C50 60 50 100 70 80 C90 60 110 100 130 80 C150 60 150 100 130 80 C110 100 90 60 70 80 Z"
          stroke="#1E40AF"
          strokeWidth="6"
          fill="none"
          opacity="0.9"
        />
        
        {/* Surrounding nodes */}
        <g fill="#3B82F6" opacity="0.7">
          <circle cx="50" cy="40" r="8" />
          <circle cx="100" cy="30" r="8" />
          <circle cx="150" cy="40" r="8" />
          <circle cx="170" cy="80" r="8" />
          <circle cx="150" cy="120" r="8" />
          <circle cx="100" cy="130" r="8" />
          <circle cx="50" cy="120" r="8" />
          <circle cx="30" cy="80" r="8" />
        </g>
        
        {/* Connecting lines */}
        <g stroke="#3B82F6" strokeWidth="2" opacity="0.4">
          <line x1="50" y1="48" x2="70" y2="65" />
          <line x1="100" y1="38" x2="100" y2="65" />
          <line x1="150" y1="48" x2="130" y2="65" />
          <line x1="162" y1="80" x2="138" y2="80" />
          <line x1="150" y1="112" x2="130" y2="95" />
          <line x1="100" y1="122" x2="100" y2="95" />
          <line x1="50" y1="112" x2="70" y2="95" />
          <line x1="38" y1="80" x2="62" y2="80" />
        </g>
        
        {/* Growth arrows */}
        <g stroke="#1E40AF" strokeWidth="2" fill="#1E40AF" opacity="0.6">
          <line x1="30" y1="30" x2="40" y2="20" />
          <polygon points="40,20 35,25 45,25" />
          
          <line x1="170" y1="30" x2="180" y2="20" />
          <polygon points="180,20 175,25 185,25" />
          
          <line x1="170" y1="130" x2="180" y2="140" />
          <polygon points="180,140 175,135 185,135" />
          
          <line x1="30" y1="130" x2="40" y2="140" />
          <polygon points="40,140 35,135 45,135" />
        </g>
      </svg>
    </div>
  );
};

export default UnlimitedScaleArt;
