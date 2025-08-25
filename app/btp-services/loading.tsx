export default function BTPServicesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="h-10 bg-gray-200 rounded-md animate-pulse mb-4 w-3/4 mx-auto"></div>
        <div className="h-6 bg-gray-200 rounded-md animate-pulse w-2/3 mx-auto"></div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="h-10 bg-gray-200 rounded-md animate-pulse w-1/2"></div>
        <div className="h-10 bg-gray-200 rounded-md animate-pulse w-1/4"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
        ))}
      </div>
    </div>
  )
}
