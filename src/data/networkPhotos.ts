import photo1 from "@/assets/network-1.webp.asset.json";
import photo2 from "@/assets/network-2.webp.asset.json";
import photo3 from "@/assets/network-3.webp.asset.json";
import photo4 from "@/assets/network-4.webp.asset.json";
import photo5 from "@/assets/network-5.webp.asset.json";
import photo6 from "@/assets/network-6.webp.asset.json";
import photo7 from "@/assets/network-7.webp.asset.json";
import photo8 from "@/assets/network-8.webp.asset.json";

// Resolve against the asset-serving origin, not Vercel, which has no asset proxy.
const assetOrigin = "https://id-preview--965b1055-a682-407b-a3ea-205b17ad63fe.lovable.app";
export const networkPhotos = [photo1, photo2, photo3, photo4, photo5, photo6, photo7, photo8].map((asset) => new URL(asset.url, assetOrigin).href);