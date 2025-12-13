import React from 'react';
interface StandardHeroProps {
  title: string;
  subtitle: string;
  highlightText?: string;
  className?: string;
}
export const StandardHero: React.FC<StandardHeroProps> = ({
  title,
  subtitle,
  highlightText,
  className = ""
}) => {
  return <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[150px] pb-20 ${className}`}>
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          {title}
          {highlightText && <span className="block text-xl text-gray-600 font-normal">{highlightText}</span>}
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto px-4">
          {subtitle}
        </p>
      </div>
    </div>;
};