const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api` ?? 'http://localhost:5000/api';

export const uploadFiles = async (files) => {
  try {
    const formData = new FormData();

    // Append each file to the form data
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload files');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
};

export const getFiles = async () => {
  try {
    const response = await fetch(`${API_URL}/files`);

    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
};

export const deleteFile = async (fileId) => {
  try {
    const response = await fetch(`${API_URL}/files/${fileId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
