export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="bg-marine/90">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="skeleton h-12 w-12 rounded-xl opacity-20" />
          <div className="skeleton mt-6 h-11 w-3/4 max-w-xl rounded-lg opacity-20" />
          <div className="skeleton mt-4 h-5 w-1/2 max-w-md rounded-lg opacity-20" />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-72 rounded-[0.875rem]" />
        ))}
      </div>
    </div>
  );
}
