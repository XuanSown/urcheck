export function primaryImageUrl(images?: { url: string; isPrimary?: boolean }[] | null): string | null {
  if (!images || images.length === 0) return null;
  return images.find((i) => i.isPrimary)?.url ?? images[0].url ?? null;
}
