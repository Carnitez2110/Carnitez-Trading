export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight">
          The Financial Architect
        </h1>
        <p className="text-on-surface-variant font-body">
          Design system loaded successfully
        </p>
        <div className="flex gap-4 justify-center">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded text-sm">Primary</span>
          <span className="px-3 py-1 bg-secondary/10 text-secondary rounded text-sm">Secondary</span>
          <span className="px-3 py-1 bg-tertiary/10 text-tertiary rounded text-sm">Tertiary</span>
          <span className="px-3 py-1 bg-error/10 text-error rounded text-sm">Error</span>
        </div>
      </div>
    </div>
  );
}
