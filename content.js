// Function to send task completion details to background.js
function sendContentToBackground(promptId, content) {
    // Retrieve UUID from localStorage or other storage mechanism (you can set this in your background.js or server)
    const uuid = localStorage.getItem('device-uuid');  // Assuming UUID is stored in localStorage

    if (!uuid) {
        console.error('UUID not found for the device');
        return;
    }

    // Sending message to background.js with actual device UUID and task details
    chrome.runtime.sendMessage({
      action: 'sendPromptCompletion',
      promptId,  // Task ID
      body: {
        uuid,  // Use the actual UUID dynamically
        consoleOutput: content
      }
    }, (response) => {
      console.log('Response from background:', response);
    });
}

// Example: Simulate task completion based on page load
if (document.readyState === 'complete') {
  // Simulate task completion on page load
  const content = {
    status: 'success',
    message: 'Task completed successfully on page load'
  };

  // Replace `1` with the actual prompt/task ID
  sendContentToBackground(1, content);
}

// You can also set up event listeners for user interactions or other triggers
document.getElementById('complete-task-button')?.addEventListener('click', () => {
  // Simulate task completion on button click
  const content = {
    status: 'success',
    message: 'Task completed by user click'
  };
  
  // Replace `1` with the actual prompt/task ID
  sendContentToBackground(1, content);
});
