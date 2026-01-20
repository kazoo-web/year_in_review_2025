import { Photo } from "@/types/photo";

// Placeholder for your 45 photos
// Import your photos here as you add them:
// import photo1 from "@/assets/photos/photo-1.jpg";

export const samplePhotos: Photo[] = Array.from({ length: 45 }, (_, i) => ({
  id: String(i + 1),
  src: "", // Add your photo import here
  location: `Photo ${i + 1} - Add Location`,
  date: "Add Date",
  katherineComment: "Add Katherine's comment",
  djComment: "Add DJ's comment",
}));
