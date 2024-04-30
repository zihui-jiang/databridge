
import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests

function App() {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const URL = 'https://sot2qb0384.execute-api.us-west-2.amazonaws.com/presignedUrl';


  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleFileUpload= async (event) => {
    const selectedFile = event.target.files[0]; // Set the selected file to the state
    if (!selectedFile) {
      console.error('No file selected');
      return;
    }
    
    console.info(selectedFile.name);
    try {
      // Get pre-signed URL from server
      const response = await axios.get(URL, {
        params: { fileName: selectedFile.name},
      });
      console.info(response);
      const presignedUrl = response.data;
      console.info(presignedUrl);
      // Upload file to S3 using pre-signed URL
      const afterUpload = await axios.put(presignedUrl, selectedFile, {
        headers: { 'Content-Type': selectedFile.type },
      });
      console.info(afterUpload);
      console.log('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleSubmit = () => {
    // In the handleSubmit function, you can implement the logic to upload the file and input text to your backend without using any AWS Amplify resources. 
    // You can use standard HTTP requests (e.g., Fetch API) to communicate with your backend API.
    console.log('Input Text:', inputText);
    console.log('File:', file);
  };



  return (
    <div className="App">
      <h1>Fovus Coding App</h1>
      <div>
        <label>
          Text Input:
          <input type="text" value={inputText} onChange={handleInputChange} />
        </label>
      </div>
      <div>
        <label>
        File Input:
          <input type="file" onChange={handleFileUpload} />
        </label>
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default App;