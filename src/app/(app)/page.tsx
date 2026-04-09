export default function DashboardPage() {
  return (
    <div>
      <header className="mb-10">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          Dashboard
        </h1>
        <p className="text-on-surface-variant">
          Your AI-powered trading command center.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-surface-container-low rounded-xl p-8">
            <p className="text-on-surface-variant text-sm uppercase tracking-widest mb-1">
              Total Portfolio Value
            </p>
            <p className="text-5xl font-extrabold font-headline tracking-tight">
              €0.00
            </p>
          </div>
          <div className="bg-surface-container rounded-xl p-6">
            <h2 className="text-xl font-bold font-headline mb-4">Active AI Signals</h2>
            <p className="text-on-surface-variant text-sm">
              No signals yet. Connect your market data to get started.
            </p>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low rounded-xl p-6">
            <p className="text-sm font-bold font-headline text-on-surface-variant uppercase tracking-widest mb-4">
              Market Sentiment
            </p>
            <p className="text-on-surface-variant text-sm">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
