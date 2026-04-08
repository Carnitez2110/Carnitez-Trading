export default function MarketsPage() {
  return (
    <div>
      <header className="mb-10">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          Markets & Watchlist
        </h1>
        <p className="text-on-surface-variant">
          Track tickers and discover opportunities.
        </p>
      </header>

      <div className="space-y-6">
        <div className="bg-surface-container-low rounded-xl p-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-lg w-full max-w-md">
            <span className="material-symbols-outlined text-sm text-primary">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-on-surface-variant w-full placeholder:text-outline/40"
              placeholder="Search stocks, ETFs, crypto..."
              type="text"
            />
          </div>
        </div>
        <div className="bg-surface-container rounded-xl p-6">
          <h2 className="text-xl font-bold font-headline mb-4">Your Watchlist</h2>
          <p className="text-on-surface-variant text-sm">
            No tickers in your watchlist. Search and add some above.
          </p>
        </div>
      </div>
    </div>
  );
}
