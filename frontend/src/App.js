
import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests

function App() {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const URL = 'https://sot2qb0384.execute-api.us-west-2.amazonaws.com';


  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const getPresignedUrl =  async() => {
    // GET request: presigned URL
    const response = await axios.get(URL+"/presignedUrl", {
      params: { fileName: selectedFile.name},
    });

    console.info(response);
    return response;
  };



  const uploadToPresignedUrl  = async(presignedUrl) => {
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
    console.log(uploadResponse);

  }


  const handleSubmit = async() => {
    try {
      // Ensure a file is selected
      if (!selectedFile) {
        console.error("No file selected.");
        return;
      }
      if (selectedFile.type != 'text/plain') {
        console.error("File type error.");
        return;
      }

    const res = getPresignedUrl();
    const presignedUrl = (await res).data.url;
    
    const bucketName = (await res).data.bucket;
    uploadToPresignedUrl(presignedUrl);

    // const bucketName = presignedUrl.match(/https:\/\/([^.]+)\.s3\.[^.]+\.amazonaws\.com/)[1];

    console.log(bucketName);


      // upload to dynamoDB
      // let s3Path = 
      // await axios.post()
    } catch (error) {
      // Handle error
      console.error("Error uploading file:", error);
    }
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
          <input type="file" onChange={handleFileChange} />
        </label>
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default App;