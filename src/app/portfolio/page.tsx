export default function PortfolioPage() {
  return (
    <div>
      <header className="mb-10">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          Portfolio
        </h1>
        <p className="text-on-surface-variant">
          Track your holdings and trade history.
        </p>
      </header>

      <div className="space-y-6">
        <div className="bg-surface-container-low rounded-xl p-8">
          <h2 className="text-xl font-bold font-headline mb-4">Holdings</h2>
          <p className="text-on-surface-variant text-sm">
            No holdings yet. Approve a trade signal to get started.
          </p>
        </div>
        <div className="bg-surface-container rounded-xl p-6">
          <h2 className="text-xl font-bold font-headline mb-4">Trade History</h2>
          <p className="text-on-surface-variant text-sm">
            No trades recorded yet.
          </p>
        </div>
      </div>
    </div>
  );
}
