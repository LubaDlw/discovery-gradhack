const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export class GeminiService {
  static async sendMessage(chatHistory) {
    const payload = {
      contents: chatHistory,
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

    const maxRetries = 5;
    let retryCount = 0;
    let delay = 1000;

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.candidates && result.candidates.length > 0 &&
              result.candidates[0].content && result.candidates[0].content.parts &&
              result.candidates[0].content.parts.length > 0) {
            
            return result.candidates[0].content.parts[0].text;
          } else {
            throw new Error("Unexpected API response structure");
          }
        } else if (response.status === 429) {
          console.warn(`Rate limit exceeded. Retrying in ${delay / 1000} seconds...`);
          await new Promise(res => setTimeout(res, delay));
          delay *= 2;
          retryCount++;
        } else {
          const errorData = await response.json();
          throw new Error(`API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }
      } catch (error) {
        if (retryCount === maxRetries - 1) {
          throw error;
        }
        retryCount++;
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
      }
    }

    throw new Error('Failed to get response after maximum retries');
  }
}