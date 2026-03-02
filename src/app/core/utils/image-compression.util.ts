export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  targetMaxBytes?: number;
  initialQuality?: number;
  minQuality?: number;
}

const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 2560,
  maxHeight: 1440,
  targetMaxBytes: 2_500_000,
  initialQuality: 0.82,
  minQuality: 0.6,
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Não foi possível carregar a imagem para compressão.'));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Falha ao gerar arquivo compactado.'));
          return;
        }

        resolve(blob);
      },
      'image/jpeg',
      quality,
    );
  });
}

function toJpegFileName(name: string): string {
  const lastDot = name.lastIndexOf('.');
  const baseName = lastDot > 0 ? name.slice(0, lastDot) : name;

  return `${baseName}.jpg`;
}

export async function compressImageFile(file: File, options?: ImageCompressionOptions): Promise<File> {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const image = await loadImage(file);

  const ratio = Math.min(
    1,
    settings.maxWidth / image.width,
    settings.maxHeight / image.height,
  );

  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas não suportado no navegador.');
  }

  context.drawImage(image, 0, 0, width, height);

  let quality = settings.initialQuality;
  let blob = await canvasToBlob(canvas, quality);

  while (blob.size > settings.targetMaxBytes && quality > settings.minQuality) {
    quality = Math.max(settings.minQuality, quality - 0.08);
    blob = await canvasToBlob(canvas, quality);
  }

  if (blob.size >= file.size) {
    return file;
  }

  return new File([blob], toJpegFileName(file.name), {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}
