chrome.storage.local.clear(() => {
    console.log('Storage cleared');
  });
  
  document.addEventListener('mouseup', async function() {
      const selectedText = window.getSelection().toString().trim();
      
      if (selectedText) {
          try {
              await chrome.storage.local.set({ 
                  'selectedText': selectedText,
                  'timestamp': Date.now() // Add timestamp to ensure updates
              });
              console.log('Saved text:', selectedText);
          } catch (error) {
              console.error('Error saving:', error);
          }
      }
  });

