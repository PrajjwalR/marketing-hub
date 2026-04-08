import axios from 'axios';

const API_BASE = '/api';

export interface ModelInfo {
  id: string;
  name: string;
  style: string;
  image: string;
}

export interface GenerateResult {
  status?: string;
  session_id?: string;
  jewelry_type?: string;
  images: (string | { url: string; label: string })[];
}

/**
 * Call the backend to generate a photoshoot.
 */
export async function generatePhotoshoot(
  selectedModel: ModelInfo,
  jewelryImage: File,
  jewelryType: string
): Promise<GenerateResult> {
  // Fetch the model image as a Blob so we can send it as a file
  const modelResponse = await fetch(selectedModel.image);
  const modelBlob = await modelResponse.blob();

  const formData = new FormData();
  formData.append('model_image', modelBlob, 'model.png');
  formData.append('jewelry_image', jewelryImage);
  formData.append('jewelry_type', jewelryType);

  const response = await axios.post<GenerateResult>(
    `${API_BASE}/AI-photoshoot`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300_000, // 5 min timeout for AI generation + potential backoffs
    }
  );

  return response.data;
}
