import React, { useState } from "react";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "./firebase";
import { v4 } from "uuid";
import './App.css';

function UploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    const uploadPromises = Array.from(files).map((file) => {
      const imageRef = ref(storage, `${file.name + v4()}`);
      const uploadTask = uploadBytesResumable(imageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => reject(error),
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((url) => {
              resolve(url);
            });
          }
        );
      });
    });

    try {
      await Promise.all(uploadPromises);
      setShowAlert(true);
    } catch (err) {
      alert("Yükləmə zamanı xəta baş verdi!");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="App">
      {isUploading && (
        <div className="overlay">
          <div className="loader"></div>
        </div>
      )}

      {showAlert && (
        <div className="custom-alert">
          <div className="alert-box">
            <h2>✅ Yükləmə uğurla başa çatdı!</h2>
            <button className="cancel-btn" onClick={() => setShowAlert(false)}>
              Bağla
            </button>
          </div>
        </div>
      )}

      <label htmlFor="fileUpload" className="upload-btn">
        📤 Şəkil yüklə
      </label>
      <input
        type="file"
        id="fileUpload"
        onChange={handleFileChange}
        multiple
        style={{ display: "none" }}
      />
    </div>
  );
}

export default UploadPage;
