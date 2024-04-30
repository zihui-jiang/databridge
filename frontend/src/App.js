
import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests

function App() {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const URL = 'https://sot2qb0384.execute-api.us-west-2.amazonaws.com/presignedUrl';
  const BUCKET_NAME = useState('');


  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleFileUpload= async (event) => {
    setSelectedFile(event.target.files[0]);
    if (!selectedFile) {
      console.error('No file selected');
      return;
    }
    console.info(selectedFile.type);
    if (selectedFile.type != 'text/plain') {
      throw new Error("File type error")
    }

    try {
      // Get pre-signed URL from server
      const response = await axios.get(URL, {
        params: { fileName: selectedFile.name},
      });
      console.info(response);
      const presignedUrl = response.data;
      console.info(presignedUrl);


      const uploadResponse = await axios.put(presignedUrl, selectedFile, {
        headers: {
          "Content-Type": 'text/plain',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      });

    //   // Upload file to S3 using pre-signed URL
    //   const uploadResponse = await axios.put(presignedUrl, selectedFile, {
    //     headers: {
    //       'Content-Type': 'text/plain', // Set the Content-Type header
    //   } 
    // });
      console.log('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleSubmit = () => {
    // In the handleSubmit function, you can implement the logic to upload the file and input text to your backend without using any AWS Amplify resources. 
    // You can use standard HTTP requests (e.g., Fetch API) to communicate with your backend API.
    console.log('Input Text:', inputText);
    // console.log('File:', file);
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