export const chunkText = (text, chunkSize = 1000, overlap = 100) => {
  const chunks = [];
  const step = chunkSize - overlap;

  if (step <= 0) {
    throw new Error("chunkSize must be greater than overlap");
  }

  let start = 0;

  while (start < text.length) {
    const end = start + chunkSize;

    chunks.push(text.slice(start, end));
    start += step;
  }

  return chunks;
};
