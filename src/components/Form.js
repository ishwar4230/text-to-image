import React, { useState, useRef } from 'react';
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

  const handleShare = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Clear previous drawings
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw each image on the canvas
      imageUrls.forEach((imageUrl, index) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Enable cross-origin for the images
        img.src = imageUrl;
        img.onload = () => {
          context.drawImage(img, (index % 5) * 50, Math.floor(index / 5) * 50, 50, 50);
        };
      });

      // Convert canvas to data URL
      const panelImageUrl = canvas.toDataURL('image/png');

      // Use the Web Share API to share the image
      if (navigator.share) {
        navigator.share({
          files: [new File([panelImageUrl], 'image_panel.png', { type: 'image/png' })],
        })
          .then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing:', error));
      } else {
        console.log('Web Share API not supported');
      }
    }
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
