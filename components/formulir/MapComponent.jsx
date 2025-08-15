import { MapPin } from 'lucide-react';

export default function MapComponent({ location, address }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      {/* Map */}
      <div className="aspect-square bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
        <img 
          src="https://via.placeholder.com/300x300/E5E7EB/9CA3AF?text=Map"
          alt="Location Map"
          className="w-full h-full object-cover"
        />
        {/* Map markers */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
        </div>
      </div>

      {/* Location Info */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700">
            {address || "Jl. Veteran No.10-11, Ketawanggede, Kec. Lowokwaru, Kota Malang, Jawa Timur 65145"}
          </p>
        </div>
      </div>
    </div>
  );
}
