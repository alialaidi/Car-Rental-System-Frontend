import type { VehicleImage } from '../model/vehicle';
import styles from './catalog.module.css';

export function VehicleGallery({ images, title }: { images: VehicleImage[]; title: string }) {
  const ordered = [...images].sort(
    (left, right) => Number(right.isPrimary) - Number(left.isPrimary),
  );
  if (ordered.length === 0)
    return <div className={styles.galleryFallback}>No vehicle photos available.</div>;
  return (
    <div className={styles.gallery} aria-label="Vehicle photos">
      {ordered.map((image, index) => (
        <img
          key={image.imageId}
          src={image.imageUrl}
          alt={title + (index === 0 ? '' : ' photo ' + (index + 1))}
          fetchPriority={index === 0 ? 'high' : 'auto'}
        />
      ))}
    </div>
  );
}
