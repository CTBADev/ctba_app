import React, { useState } from "react";

const ImageUpload = ({ onUpload }) => {
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleUpload = () => {
    if (image) {
      onUpload(image); // Pass the image file to the parent component
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {image && (
        <img src={URL.createObjectURL(image)} alt="Preview" width="100" />
      )}
      <button onClick={handleUpload}>Upload Image</button>
    </div>
  );
};

export default ImageUpload;
