export const createFileFromPhotoString = (fileData: string | File, fileName: string): { file: File | undefined, contentType: string } => {
  let contentType = 'image/jpeg'; // Default MIME type

  if (typeof fileData === 'string' && fileData.startsWith('data:')) {
    const mimeTypeMatch = fileData.match(/^data:(.*?);base64,/);
    if (mimeTypeMatch) {
      contentType = mimeTypeMatch[1]; // Update contentType with extracted MIME type
      const binaryData = atob(fileData.replace(/^data:(.*?);base64,/, ''));
      const byteArray = Uint8Array.from(binaryData, char => char.charCodeAt(0));
      const file = new File([byteArray], fileName, { type: contentType });
      return { file, contentType };
    }
  } else if (fileData instanceof File) {
    return { file: fileData, contentType: fileData.type };
  } else {
    console.warn("Unknown file data format. Ensure fileData is a valid File, Blob, or data URL.");
  }

  return { file: undefined, contentType };
};
