export default function Loading() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-48 bg-gray-light animate-pulse rounded" />
      <div className="lg:grid lg:grid-cols-5 lg:gap-4">
        <div className="lg:col-span-3 h-[400px] lg:h-[600px] bg-gray-light animate-pulse rounded-lg" />
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-light animate-pulse rounded-lg"
              />
            ))}
          </div>
          <div className="h-48 bg-gray-light animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  );
}
