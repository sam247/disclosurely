
import React from 'react';
import WhistleblowerMessaging from '@/components/WhistleblowerMessaging';

const WhistleblowerMessagingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Secure Communication
          </h1>
          <p className="text-gray-600">
            Use your tracking ID to communicate securely about your report
          </p>
        </div>
        <WhistleblowerMessaging />
      </div>
    </div>
  );
};

export default WhistleblowerMessagingPage;
