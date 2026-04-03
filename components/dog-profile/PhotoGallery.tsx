type Photo = {
  url: string;
  alt: string;
};

type PhotoGalleryProps = {
  photos: Photo[];
};

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const gallery = photos.slice(1);

  if (gallery.length === 0) return null;

  return (
    <div>
      <h3 className="font-heading text-lg font-semibold text-charcoal mb-4">
        More photos
      </h3>

      {/* Horizontal scroll on mobile, grid on md+ */}
      <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
        {gallery.map((photo) => (
          <img
            key={photo.url}
            src={photo.url}
            alt={photo.alt}
            className="aspect-square w-48 shrink-0 rounded-2xl object-cover md:w-full"
          />
        ))}
      </div>
    </div>
  );
}
