
const ComplianceArt = () => {
  return (
    <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
      <svg width="200" height="160" viewBox="0 0 200 160" className="drop-shadow-lg">
        {/* Shield background */}
        <path
          d="M100 20 L160 40 L160 100 C160 120 140 140 100 140 C60 140 40 120 40 100 L40 40 Z"
          fill="#1E40AF"
          opacity="0.1"
        />
        
        {/* Main shield */}
        <path
          d="M100 30 L150 45 L150 95 C150 110 130 125 100 125 C70 125 50 110 50 95 L50 45 Z"
          fill="#3B82F6"
          opacity="0.9"
        />
        
        {/* Checkmark */}
        <path
          d="M80 75 L95 90 L120 65"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Compliance badges around shield */}
        <g fill="#1E40AF" opacity="0.7" className="text-xs font-semibold">
          <text x="25" y="50" textAnchor="middle">ISO</text>
          <text x="25" y="62" textAnchor="middle">27001</text>
          
          <text x="175" y="50" textAnchor="middle">GDPR</text>
          
          <text x="25" y="110" textAnchor="middle">SOC2</text>
          
          <text x="175" y="110" textAnchor="middle">AES</text>
          <text x="175" y="122" textAnchor="middle">256</text>
        </g>
        
        {/* Connection lines */}
        <g stroke="#3B82F6" strokeWidth="1" opacity="0.4">
          <line x1="40" y1="56" x2="70" y2="70" />
          <line x1="160" y1="50" x2="130" y2="65" />
          <line x1="40" y1="110" x2="70" y2="95" />
          <line x1="160" y1="116" x2="130" y2="100" />
        </g>
      </svg>
    </div>
  );
};

export default ComplianceArt;
