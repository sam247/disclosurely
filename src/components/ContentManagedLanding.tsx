import React from 'react';
import Landing from './Landing';

// Mock organization context for public landing page
const MockOrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const ContentManagedLanding = () => {
  return (
    <MockOrganizationProvider>
      <Landing />
    </MockOrganizationProvider>
  );
};

export default ContentManagedLanding;