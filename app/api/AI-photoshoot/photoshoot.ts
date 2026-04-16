import axios from 'axios';
import { AI_PHOTOSHOOT_VARIATIONS_PER_RUN } from '@/lib/prompts';

const API_BASE = '/api';

export interface ModelInfo {
  id: string;
  name: string;
  style: string;
  image: string;
}

export type GenerationMode = 'photo' | 'video';

export interface GenerateResult {
  status?: string;
  session_id?: string;
  jewelry_type?: string;
  /** Present when generation_mode is "photo" */
  images?: (string | { url: string; label: string })[];
  /** Present when generation_mode is "video" */
  video_url?: string;
  /** Echoed back from the backend so the UI knows what was generated */
  type?: GenerationMode;
}

type ProgressiveImage = { url: string; label: string };
type OnPhotoProgress = (payload: {
  image: ProgressiveImage;
  index: number;
  total: number;
  sessionId: string;
}) => void;

/**
 * Call the backend to generate a photoshoot (photo or video).
 */
export async function generatePhotoshoot(
  selectedModel: ModelInfo,
  jewelryImage: File,
  jewelryType: string,
  generationMode: GenerationMode = 'photo',
  onPhotoProgress?: OnPhotoProgress
): Promise<GenerateResult> {
  // Fetch the model image as a Blob so we can send it as a file
  const modelResponse = await fetch(selectedModel.image);
  const modelBlob = await modelResponse.blob();

  if (generationMode === 'video') {
    const formData = new FormData();
    formData.append('model_image', modelBlob, 'model.png');
    formData.append('jewelry_image', jewelryImage);
    formData.append('jewelry_type', jewelryType);
    formData.append('generation_mode', generationMode);

    const response = await axios.post<GenerateResult>(
      `${API_BASE}/AI-photoshoot`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 600_000, // 10 min timeout for video generation + polling
      }
    );
    return response.data;
  }

  // PHOTO mode: request one variation at a time for progressive UI.
  const images: ProgressiveImage[] = [];
  let sessionId = '';

  for (let i = 0; i < AI_PHOTOSHOOT_VARIATIONS_PER_RUN; i++) {
    const formData = new FormData();
    formData.append('model_image', modelBlob, 'model.png');
    formData.append('jewelry_image', jewelryImage);
    formData.append('jewelry_type', jewelryType);
    formData.append('generation_mode', 'photo');
    formData.append('variation_index', String(i));
    if (sessionId) formData.append('run_session_id', sessionId);

    const response = await axios.post<GenerateResult>(`${API_BASE}/AI-photoshoot`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300_000,
    });

    if (!sessionId && response.data.session_id) {
      sessionId = response.data.session_id;
    }

    const entryRaw = response.data.images?.[0];
    const entry: ProgressiveImage | null =
      typeof entryRaw === 'string'
        ? { url: entryRaw, label: `Variation ${i + 1}` }
        : entryRaw && typeof entryRaw === 'object' && typeof entryRaw.url === 'string'
          ? { url: entryRaw.url, label: entryRaw.label || `Variation ${i + 1}` }
          : null;

    if (entry) {
      images.push(entry);
      onPhotoProgress?.({ image: entry, index: i, total: AI_PHOTOSHOOT_VARIATIONS_PER_RUN, sessionId });
    }
  }

  return {
    status: 'success',
    type: 'photo',
    session_id: sessionId,
    jewelry_type: jewelryType,
    images,
  };
}
