// First, make sure to import axios if not already done
const GEMINI_API_KEY = 'AIzaSyCnJrzmef2r99MfqsqJnbibAPM16KwKRjE';

async function generateContent(message) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: message
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Generated Content:', response.data);
    return response.data;

  } catch (error) {
    console.error('Error fetching Gemini data:', error);
    throw error;
  }
}

// Example usage:
// generateContent("Your message here");
