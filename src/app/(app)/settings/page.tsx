export default function SettingsPage() {
  return (
    <div>
      <header className="mb-10">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          Settings & Risk Management
        </h1>
        <p className="text-on-surface-variant">
          Configure your institutional guardrails and platform preferences.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 space-y-8">
          <div className="bg-surface-container-low rounded-xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                security
              </span>
              <h3 className="font-headline text-xl font-bold">Capital Protection Guardrails</h3>
            </div>
            <p className="text-on-surface-variant text-sm">
              Risk management controls will be configured here in Phase 9.
            </p>
          </div>
          <div className="bg-surface-container rounded-xl p-8">
            <h3 className="font-headline text-xl font-bold mb-4">Execution Mode</h3>
            <div className="flex bg-surface-container-lowest p-1 rounded-full w-fit">
              <button className="px-6 py-2 rounded-full text-sm font-bold bg-primary text-on-primary">
                Paper
              </button>
              <button className="px-6 py-2 rounded-full text-sm font-bold text-on-surface/50">
                Live
              </button>
            </div>
          </div>
        </section>
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-headline font-bold text-lg mb-6">Market Coverage</h3>
            <p className="text-on-surface-variant text-sm">
              Market toggles will be added in Phase 9.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
