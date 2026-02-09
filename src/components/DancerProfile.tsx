interface DancerProfileProps {
  dancerName: string;
  title: string;
  photoUrl?: string | null;
}

export function DancerProfile({ dancerName, title, photoUrl }: DancerProfileProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
      {photoUrl ? (
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-purple-100 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt={dancerName}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-purple-200 flex-shrink-0 flex items-center justify-center text-purple-500 text-3xl font-bold">
          {dancerName.charAt(0)}
        </div>
      )}
      <div className="text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-purple-900">{title}</h1>
        <p className="text-purple-700">{dancerName}</p>
      </div>
    </div>
  );
}
