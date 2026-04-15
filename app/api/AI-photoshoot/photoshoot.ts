import axios from 'axios';

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

/**
 * Call the backend to generate a photoshoot (photo or video).
 */
export async function generatePhotoshoot(
  selectedModel: ModelInfo,
  jewelryImage: File,
  jewelryType: string,
  generationMode: GenerationMode = 'photo'
): Promise<GenerateResult> {
  // Fetch the model image as a Blob so we can send it as a file
  const modelResponse = await fetch(selectedModel.image);
  const modelBlob = await modelResponse.blob();

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
