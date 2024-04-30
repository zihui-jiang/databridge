
import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests

function App() {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleFileUpload=  (event) => {
    setFile(event.target.files[0]);
    // const selectedFile = event.target.files[0]; // Set the selected file to the state
    // if (!selectedFile) {
    //   console.error('No file selected');
    //   return;
    // }
    

    // try {
    //   // Get pre-signed URL from server
    //   const response = await axios.get('http://localhost:3000/presignedUrl', {
    //     params: { fileName: "test" },
    //   });
    //   const presignedUrl = response.data;

    //   // Upload file to S3 using pre-signed URL
    //   await axios.put(presignedUrl, selectedFile, {
    //     headers: { 'Content-Type': selectedFile.type },
    //   });

    //   console.log('File uploaded successfully');
    // } catch (error) {
    //   console.error('Error uploading file:', error);
    // }
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