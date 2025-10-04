import UserManagement from '@/components/UserManagement';

const TeamView = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Team Management</h2>
        <p className="text-muted-foreground">Invite and manage team members</p>
      </div>
      <UserManagement />
    </div>
  );
};

export default TeamView;
