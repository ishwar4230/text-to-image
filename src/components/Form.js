import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import "./formstyle.css";

const Form = () => {
  const [inputValues, setInputValues] = useState(Array(10).fill(''));
  const [imageUrls, setImageUrls] = useState(Array(10).fill(''));
  const [loading, setloading] = useState(2);
  const canvasRef = useRef(null);

  const query = async (data, index) => {
    try {
      const response = await fetch(
        "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud",
        {
          headers: {
            "Accept": "image/png",
            "Authorization": "Bearer VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      // Check if the request was successful (status code 200)
      if (response.ok) {
        const blob = await response.blob();

        // Convert the blob to a data URL
        const imageUrl = URL.createObjectURL(blob);

        // Update the state with the image URL for the corresponding textbox
        setImageUrls((prevImageUrls) => {
          const newImageUrls = [...prevImageUrls];
          newImageUrls[index] = imageUrl;
          return newImageUrls;
        });
      } else {
        console.error(`Failed to fetch image from the API for textbox ${index}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = (e) => {
    setloading(1);
    e.preventDefault();

    // Loop through each textbox value and call the query function
    inputValues.forEach((value, index) => {
      query({ "inputs": value }, index);
    });

    // Simulate a delay (replace this with actual API request)
    setTimeout(() => {
      setloading(0);
    }, 2000); // Adjust the delay as needed
  };

  const handleShare = async () => {
    let done=1;
    for(let i=0;i<10;i++)
    if(imageUrls[i].length==0)
    done=0;
    if(done==0)
    {
      alert("Image not loaded yet!");
      console.log("not loaded!");
      return;
    }
    console.log(imageUrls);
    if (canvasRef.current) {
      const canvas = canvasRef.current;
  
      try {
        // Use html2canvas to capture the content of the image panel
        const canvasDataUrl = await html2canvas(canvas).then((canvas) =>
          canvas.toDataURL()
        );
  
        // Convert data URL to Blob
        const blob = dataURLtoBlob(canvasDataUrl);
  
        // Create a temporary file from the Blob
        const file = new File([blob], 'image_panel.png', { type: 'image/png' });
  
        // Use the Web Share API to share the file
        if (navigator.share) {
          navigator.share({
            files: [file],
          })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing:', error));
        } else {
          console.log('Web Share API not supported');
        }
      } catch (error) {
        console.error("Error capturing canvas content:", error);
      }
    }
  };
  
  
  // Function to convert data URL to Blob
  // Function to convert data URL to Blob
const dataURLtoBlob = (dataURL) => {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeString || 'image/png' });
};

  return (
    <div>
      <h1 id='headline'>Create and share your image panel !</h1>

      {/* Form */}
      <div id='mix'>
        <div id='formdiv'>
          <form onSubmit={handleSubmit} id='form'>
            {inputValues.map((value, index) => (
              <div key={index}>
                <label>
                  <input id='textbox'
                    type="text"
                    placeholder='Enter text to generate image'
                    value={value}
                    onChange={(e) => {
                      const newInputValues = [...inputValues];
                      newInputValues[index] = e.target.value;
                      setInputValues(newInputValues);
                    }}
                  />
                </label>
              </div>
            ))}
            <button id='submitbutton' type="submit">Submit</button>
          </form>
        </div>
        {/* Display Image Panel or Loading Message */}
        <div id='paneldiv'>
          {loading === 2 && <div>No images to display.</div>}
          {loading === 1 && <div>Loading...</div>}
          {loading === 0 && (
            <div id='imgcommon'>
              <h2>Image Panel</h2>
              <div id='imgpanel'>
                {imageUrls.map((imageUrl, index) => (
                  <div key={index} id='imgdiv'>
                    <img className='imgclass' src={imageUrl} alt={`Loading...`}  />
                  </div>
                ))}
              </div>
              <button id='share' onClick={handleShare}>Share Your Panel</button>
            </div>
          )}
        </div>
      </div>
      {/* Canvas for combining images */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
};

export default Form;
