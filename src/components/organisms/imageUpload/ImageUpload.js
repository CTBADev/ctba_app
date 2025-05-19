import React, { useState, useEffect } from "react";
import styles from "./ImageUpload.module.css";

const ImageUpload = ({ onImageUpload, isLoading, existingScoresheet }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadTime, setUploadTime] = useState(null);
  const [hasExistingScoresheet, setHasExistingScoresheet] = useState(false);

  useEffect(() => {
    if (existingScoresheet?.fields?.file?.url) {
      setHasExistingScoresheet(true);
    }
  }, [existingScoresheet]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setUploadSuccess(false);
      setUploadTime(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (image && onImageUpload) {
      try {
        await onImageUpload(image);
        setUploadSuccess(true);
        setUploadTime(new Date());
        setHasExistingScoresheet(true);
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadSuccess(false);
        setUploadTime(null);
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className={styles.container}>
      {hasExistingScoresheet && (
        <div className={styles.existingScoresheet}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          A scoresheet has already been uploaded
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className={styles.fileInput}
      />
      {preview && (
        <div className={styles.previewContainer}>
          <img src={preview} alt="Preview" className={styles.preview} />
          <div className={styles.uploadControls}>
            <button
              onClick={handleUpload}
              className={`${styles.uploadButton} ${
                isLoading ? styles.loading : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Uploading..." : "Upload"}
            </button>
            {uploadSuccess && (
              <div className={styles.uploadStatus}>
                <div className={styles.successIndicator}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 6L9 17L4 12" />
                  </svg>
                  Uploaded successfully!
                </div>
                {uploadTime && (
                  <div className={styles.uploadTime}>
                    Uploaded on {formatDate(uploadTime)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
