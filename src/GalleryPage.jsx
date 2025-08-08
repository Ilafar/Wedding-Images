import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import "./App.css";

function GalleryPage() {
  const [imageUrls, setImageUrls] = useState([]);
  const [modalImage, setModalImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(new Set());

  const navigate = useNavigate();
  const imagesListRef = ref(storage);

  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/admin");
      return;
    }

    listAll(imagesListRef).then((response) => {
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageUrls((prev) => {
            if (!prev.includes(url)) {
              // Mark image as loading initially
              setLoadingImages((prevLoading) => new Set(prevLoading).add(url));
              return [...prev, url];
            }
            return prev;
          });
        });
      });
    });
  }, [navigate]);

  const toggleSelect = (url) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(url)) {
        newSet.delete(url);
      } else {
        newSet.add(url);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(imageUrls));
    }
    setSelectAll(!selectAll);
  };

  const downloadSelected = async () => {
    if (selectedImages.size === 0) return;
    setIsDownloading(true);
    try {
      if (selectedImages.size === 1) {
        const url = Array.from(selectedImages)[0];
        const res = await fetch(url);
        const blob = await res.blob();
        const a = document.createElement("a");
        const rawName = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
        const match = rawName.match(/(.+\.(jpg|jpeg|png|gif))/i);
        const filename = match ? match[1] : "image.jpg";
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
      } else if (selectedImages.size > 1) {
        const zip = new JSZip();
        const downloadPromises = Array.from(selectedImages).map(async (url, i) => {
          const response = await fetch(url);
          const blob = await response.blob();
          const rawName = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
          const match = rawName.match(/(.+\.(jpg|jpeg|png|gif))/i);
          const filename = match ? match[1] : `image_${i}.jpg`;
          zip.file(filename, blob);
        });

        await Promise.all(downloadPromises);
        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, "images.zip");
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("Yükləmə zamanı xəta baş verdi.");
    } finally {
      setIsDownloading(false);
    }
  };

  const deleteSelected = async () => {
    if (selectedImages.size === 0) return;
    const confirmed = window.confirm("Seçilmiş şəkillər silinsin?");
    if (!confirmed) return;

    const deletePromises = Array.from(selectedImages).map(async (url) => {
      const rawName = decodeURIComponent(
        url
          .substring(url.indexOf("/o/") + 3, url.indexOf("?"))
          .replace(/\+/g, " ")
      );
      const imageRef = ref(storage, rawName);
      await deleteObject(imageRef);
    });

    await Promise.all(deletePromises);

    setImageUrls((prev) => prev.filter((url) => !selectedImages.has(url)));
    setSelectedImages(new Set());
    setSelectAll(false);
  };

  return (
    <div className="gallery">
      <h1 className="labelGallery">Yüklənmiş şəkillər</h1>

      <div className="top-controls">
        <div className="left">
          <label className="select-all">
            <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
            Hamısını seç
          </label>
        </div>
        <div className="right">
          <button
            className="delete-btn"
            disabled={selectedImages.size === 0}
            onClick={deleteSelected}
          >
            🗑 Sil ({selectedImages.size})
          </button>
          <button
            className="download-btn"
            disabled={selectedImages.size === 0}
            onClick={downloadSelected}
          >
            📥 Yüklə ({selectedImages.size})
          </button>
        </div>
      </div>

      <div className="image-grid">
        {imageUrls.map((url, index) => (
          <div key={index} className="image-wrapper">
            <input
              type="checkbox"
              className="image-checkbox"
              checked={selectedImages.has(url)}
              onChange={() => toggleSelect(url)}
              title="Seç"
            />
            {loadingImages.has(url) && (
              <div className="image-spinner-overlay">
                <div className="spinner"></div>
              </div>
            )}
            <img
              src={url}
              alt={`uploaded ${index}`}
              className="image-fixed"
              onClick={() => setModalImage(url)}
              onLoad={() => {
                setLoadingImages((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(url);
                  return newSet;
                });
              }}
              onError={() => {
                setLoadingImages((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(url);
                  return newSet;
                });
              }}
              style={{ cursor: "pointer" }}
            />
          </div>
        ))}
      </div>

      {modalImage && (
        <div className="modal-overlay" onClick={() => setModalImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={modalImage}
              alt="large view"
              style={{ maxHeight: "90vh", maxWidth: "90vw" }}
            />
            <button className="modal-close" onClick={() => setModalImage(null)}>
              ✕
            </button>
          </div>
        </div>
      )}

      {isDownloading && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
          <div className="spinner-text">Yüklənir...</div>
        </div>
      )}
    </div>
  );
}

export default GalleryPage;
