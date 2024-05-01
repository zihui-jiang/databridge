
import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests

function App() {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const endPoint = 'https://ozhjdlw3ga.execute-api.us-west-2.amazonaws.com';
  const endPoint2 = 'https://u3d1qlli22.execute-api.us-west-2.amazonaws.com';

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const getPresignedUrl =  async() => {
    // GET request: presigned URL
    const response = await axios.get(endPoint+"/presignedUrl", {
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

  const uploadInputs = async(inputText, fileName) => {
    const postData = {
      inputText: inputText,
      fileName: fileName
    };
    const response = await axios.post(endPoint2 + '/fileUpload', postData);
    console.log('Response:', response.data);
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
      if(inputText == "") {
        console.error("Input text is empty.");
        return;
      }
      console.info(inputText);
      console.info(selectedFile.name);
      

      const res = getPresignedUrl();
      const presignedUrl = (await res).data.url;
      uploadToPresignedUrl(presignedUrl);
      // upload to dynamoDB
      uploadInputs(inputText, selectedFile.name)
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