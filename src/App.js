import { useState, useEffect } from "react";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
} from "firebase/storage";
import { storage } from "./firebase";
import { v4 } from "uuid";
import './App.css';

function App() {
  const [imageUrls, setImageUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const imagesListRef = ref(storage);

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
          (error) => {
            console.error("Upload failed:", error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((url) => {
              resolve(url);
            });
          }
        );
      });
    });

    try {
      const urls = await Promise.all(uploadPromises);
      setImageUrls((prev) => [...new Set([...prev, ...urls])]);
    } catch (err) {
      console.error("One or more uploads failed", err);
    }

    setIsUploading(false);
  };

  useEffect(() => {
    listAll(imagesListRef).then((response) => {
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageUrls((prev) => {
            if (!prev.includes(url)) {
              return [...prev, url];
            }
            return prev;
          });
        });
      });
    });
  }, []);

  return (
    <div className="App">
      {isUploading && (
        <div className="overlay">
          <div className="loader"></div>
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

      <div className="image-grid">
        {imageUrls.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`uploaded ${index}`}
            className="image-fixed"
          />
        ))}
      </div>
    </div>
  );
}

export default App;
