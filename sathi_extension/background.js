const GEMINI_API_KEY = 'AIzaSyCN2hiWMhmwx50ZvCEu5DsjNgVRwhOXMM4';  // Store your API key here securely

async function generateContent() {
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY;
  
  const requestBody = {
    contents: [
      {
        parts: [
          { text: "Generate Content based on Query" }
        ]
      }
    ]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    console.log('Generated Content:', data);
    
    // You can now use the `data` as needed in your extension (e.g., store it, display it in popup, etc.)

  } catch (error) {
    console.error('Error fetching Gemini data:', error);
  }
}

// Call the function to generate content (trigger on an event, like button click)
generateContent();
