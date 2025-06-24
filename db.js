const DB_NAME = 'ReceptionVideoDB';
const STORE_NAME = 'videos';
let db;

// Initializes the database and creates the object store if needed
async function initDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = (event) => {
      console.error('Database error:', event.target.error);
      reject('Database error');
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('Database opened successfully.');
      resolve(db);
    };

    // This event is only fired when the database is created for the first time or the version is changed
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Create an object store to hold information about the videos. We'll use 'id' as the key.
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        console.log('Object store created.');
      }
    };
  });
}

/**
 * Saves a video file and its metadata to the IndexedDB.
 * @param {File} videoFile - The video file object to save.
 */
async function saveVideo(videoFile) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    // We store the File object directly. IndexedDB handles storing blobs/files efficiently.
    const videoData = {
      name: videoFile.name,
      size: videoFile.size,
      type: videoFile.type,
      uploadDate: new Date(),
      file: videoFile, // Storing the actual file object
    };

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(videoData);

    request.onsuccess = () => {
      console.log('Video saved successfully:', videoData.name);
      resolve(request.result); // Returns the new ID
    };

    request.onerror = (event) => {
      console.error('Error saving video:', event.target.error);
      reject('Error saving video.');
    };
  });
}

/**
 * Retrieves all videos from the database.
 * The 'file' property of each object will be a File/Blob.
 */
async function getAllVideos() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error('Error getting videos:', event.target.error);
      reject('Error getting videos.');
    };
  });
}

/**
 * Deletes a video from the database by its ID.
 * @param {number} videoId - The ID of the video to delete.
 */
async function deleteVideoDB(videoId) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(videoId);

    request.onsuccess = () => {
      console.log('Video deleted successfully:', videoId);
      resolve();
    };

    request.onerror = (event) => {
      console.error('Error deleting video:', event.target.error);
      reject('Error deleting video.');
    };
  });
}
