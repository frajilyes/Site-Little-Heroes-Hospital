export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Chargement">
      <div className="-mt-[76px] bg-gradient-to-b from-sky-100 to-creme pt-[76px]">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <div className="skeleton mx-auto size-20 rounded-[1.75rem]" />
          <div className="skeleton mx-auto mt-6 h-12 w-3/4 rounded-2xl" />
          <div className="skeleton mx-auto mt-4 h-5 w-1/2 rounded-full" />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-56 rounded-[1.75rem]" />
        ))}
      </div>
    </div>
  );
}
