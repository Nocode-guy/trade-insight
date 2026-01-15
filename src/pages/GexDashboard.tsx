export function GexDashboardPage() {
  return (
    <div className="h-[calc(100vh-2rem)] w-full">
      <iframe
        src="http://localhost:8000/app"
        className="w-full h-full border-0 rounded-lg"
        title="GEX Dashboard"
        allow="fullscreen"
      />
    </div>
  );
}
