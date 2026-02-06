export async function uploadToS3Put(putUrl: string, file: File) {
  const res = await fetch(putUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`S3 PUT failed: ${res.status} ${res.statusText} ${text}`);
  }
}
