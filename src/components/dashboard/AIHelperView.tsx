import AICaseHelper from '@/components/AICaseHelper';

const AIHelperView = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">AI Case Helper</h2>
        <p className="text-muted-foreground">Analyze cases with AI-powered insights</p>
      </div>
      <AICaseHelper />
    </div>
  );
};

export default AIHelperView;
