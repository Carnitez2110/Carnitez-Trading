export default function InsightsPage() {
  return (
    <div>
      <header className="mb-10">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          AI Insights
        </h1>
        <p className="text-on-surface-variant">
          Learn from every trade. Understand every signal.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-surface-container-low rounded-xl p-8">
            <h2 className="text-xl font-bold font-headline mb-4">Signal History</h2>
            <p className="text-on-surface-variant text-sm">
              No signals analyzed yet. Once AI generates signals, their reasoning and outcomes will appear here.
            </p>
          </div>
          <div className="bg-surface-container rounded-xl p-6">
            <h2 className="text-xl font-bold font-headline mb-4">Weekly Review</h2>
            <p className="text-on-surface-variant text-sm">
              Your first weekly review will be available after your first week of trading.
            </p>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low rounded-xl p-6">
            <h2 className="text-lg font-bold font-headline mb-4">Knowledge Vault</h2>
            <p className="text-on-surface-variant text-sm">
              Trading concepts you encounter will be collected here as you learn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
