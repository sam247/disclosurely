
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Key, Clock, UserX, Activity, Eye, Lock } from 'lucide-react';
import MFASetup from './MFASetup';
import PasswordSecurity from './PasswordSecurity';
import SessionManagement from './SessionManagement';
import AccountLockout from './AccountLockout';
import SecurityMonitoring from './SecurityMonitoring';
import AuditTrail from './AuditTrail';
import SecurityHeaders from './SecurityHeaders';

const SecuritySettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Security Settings</h2>
        <p className="text-gray-600">
          Comprehensive security management and monitoring for your organization
        </p>
      </div>

      <Tabs defaultValue="monitoring" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitor
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="headers" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Headers
          </TabsTrigger>
          <TabsTrigger value="mfa" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            MFA
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Password
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="lockout" className="flex items-center gap-2">
            <UserX className="h-4 w-4" />
            Lockout
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring">
          <SecurityMonitoring />
        </TabsContent>

        <TabsContent value="audit">
          <AuditTrail />
        </TabsContent>

        <TabsContent value="headers">
          <SecurityHeaders />
        </TabsContent>

        <TabsContent value="mfa">
          <MFASetup />
        </TabsContent>

        <TabsContent value="password">
          <PasswordSecurity />
        </TabsContent>

        <TabsContent value="sessions">
          <SessionManagement />
        </TabsContent>

        <TabsContent value="lockout">
          <AccountLockout />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettings;
