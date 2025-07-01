
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Key, Clock, UserX } from 'lucide-react';
import MFASetup from './MFASetup';
import PasswordSecurity from './PasswordSecurity';
import SessionManagement from './SessionManagement';
import AccountLockout from './AccountLockout';

const SecuritySettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Security Settings</h2>
        <p className="text-gray-600">
          Manage your account security and authentication settings
        </p>
      </div>

      <Tabs defaultValue="mfa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
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
