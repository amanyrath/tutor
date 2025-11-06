export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold mb-2">Tutor Not Found</h2>
      <p className="text-gray-600 mb-4">
        The tutor you're looking for doesn't exist or has been removed.
      </p>
      <a
        href="/dashboard"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        Return to Dashboard
      </a>
    </div>
  )
}

