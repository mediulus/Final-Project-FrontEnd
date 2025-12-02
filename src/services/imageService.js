// Cloudinary image service for reliable cloud storage

const CLOUDINARY_CLOUD_NAME = 'dk2z3gg49';
// Upload presets to try (unsigned versions first)
const CLOUDINARY_UPLOAD_PRESETS = [
  'damgoodhousing_unsigned',  // Your unsigned preset
  'damgoodhousing',          // Your original preset
  'ml_default',
  'unsigned_preset',
  'default_preset'
];

/**
 * Upload image to Cloudinary
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<string>} - The Cloudinary URL
 */
async function uploadToCloudinary(imageFile) {
  // Try each upload preset until one works
  for (const preset of CLOUDINARY_UPLOAD_PRESETS) {
    try {
      console.log(`Trying Cloudinary upload preset: ${preset}`);

      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', preset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Preset "${preset}" failed: ${response.status} - ${errorText}`);

        // Parse error for better debugging
        try {
          const errorData = JSON.parse(errorText);
          console.error(`Error details:`, errorData);
        } catch (e) {
          console.error(`Raw error response:`, errorText);
        }
        continue; // Try next preset
      }

      const data = await response.json();
      if (data.error) {
        console.error(`❌ Preset "${preset}" error:`, data.error);
        continue; // Try next preset
      }

      console.log(`Upload successful with preset: ${preset}`);
      return data.secure_url;
    } catch (error) {
      console.warn(`Preset ${preset} failed:`, error.message);
      continue; // Try next preset
    }
  }

  // Last attempt: try without any preset (some accounts have default unsigned)
  try {
    console.log('Trying upload without preset (using account default)...');

    const formData = new FormData();
    formData.append('file', imageFile);
    // No upload_preset - use account default

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (!data.error) {
        console.log('✅ Upload successful without preset');
        return data.secure_url;
      }
    }
  } catch (error) {
    console.warn('Upload without preset also failed:', error.message);
  }

  throw new Error(`❌ All Cloudinary upload options failed. Please check the browser console for details and ensure you have an UNSIGNED upload preset named "damgoodhousing" in your Cloudinary dashboard.`);
}

/**
 * Upload to Filebase (free IPFS hosting)
 */
async function uploadToFilebase(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch('https://api.filebase.io/v1/ipfs', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer demo_filebase_token', // Demo token
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Filebase upload failed: ${response.status}`);
  }

  const data = await response.json();
  return `https://gateway.filebase.io/ipfs/${data.Hash}`;
}

/**
 * Convert to optimized data URL as fallback
 */
async function imageToOptimizedDataUrl(imageFile) {
  return new Promise((resolve, reject) => {
    // Create canvas for image optimization
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions (max 800px width/height)
      let { width, height } = img;
      const maxSize = 800;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // 80% quality
      resolve(dataUrl);
    };

    img.onerror = () => reject(new Error('Failed to process image'));

    const reader = new FileReader();
    reader.onload = (e) => { img.src = e.target.result; };
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Main upload function using Cloudinary
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<string>} - The uploaded image URL
 */
export async function uploadImage(imageFile) {
  console.log('Starting Cloudinary upload for:', imageFile.name);

  // Validate file
  if (!imageFile) {
    throw new Error('No image file provided');
  }

  if (!imageFile.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (imageFile.size > maxSize) {
    throw new Error('Image must be smaller than 10MB');
  }

  try {
    console.log('Uploading to Cloudinary...');
    const url = await uploadToCloudinary(imageFile);
    console.log('Cloudinary upload successful:', url);
    return url;
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
}

/**
 * Upload multiple images
 * @param {File[]} imageFiles - Array of image files to upload
 * @returns {Promise<string[]>} - Array of uploaded image URLs
 */
export async function uploadMultipleImages(imageFiles) {
  if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
    return [];
  }

  console.log(`Uploading ${imageFiles.length} images...`);

  try {
    const uploadPromises = imageFiles.map(file => uploadImage(file));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw error;
  }
}

/**
 * Test the image upload service
 * @returns {Promise<Object>} - Test result with service info
 */
export async function testImageUpload() {
  try {
    console.log('Testing image upload services...');

    // Create a tiny test image
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 1, 1);

    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        try {
          const testFile = new File([blob], 'test.png', { type: 'image/png' });
          const url = await uploadImage(testFile);

          resolve({
            success: true,
            url,
            service: 'Cloudinary',
            cloudName: CLOUDINARY_CLOUD_NAME
          });
        } catch (error) {
          reject(error);
        }
      }, 'image/png');
    });
  } catch (error) {
    throw new Error(`Test failed: ${error.message}`);
  }
}

/**
 * Resize image if it's too large (optional optimization)
 * @param {File} imageFile - Original image file
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @param {number} quality - JPEG quality (0.1 to 1.0)
 * @returns {Promise<string>} - Resized image as data URL
 */
export async function resizeAndProcessImage(imageFile, maxWidth = 1200, maxHeight = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    // Validate file
    if (!imageFile) {
      reject(new Error('No image file provided'));
      return;
    }

    if (!imageFile.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to data URL with compression
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Process multiple images
 * @param {File[]} imageFiles - Array of image files
 * @param {boolean} resize - Whether to resize images
 * @returns {Promise<string[]>} - Array of processed image URLs
 */
export async function processMultipleImages(imageFiles, resize = true) {
  if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
    return [];
  }

  console.log(`Processing ${imageFiles.length} images...`);

  try {
    const processPromises = imageFiles.map(file =>
      resize ? resizeAndProcessImage(file) : processImageFile(file)
    );

    const results = await Promise.all(processPromises);
    console.log(`Successfully processed ${results.length} images`);
    return results;
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
}

/**
 * Get image dimensions and file info
 * @param {File} imageFile - Image file to analyze
 * @returns {Promise<Object>} - Image metadata
 */
export async function getImageInfo(imageFile) {
  return new Promise((resolve, reject) => {
    if (!imageFile || !imageFile.type.startsWith('image/')) {
      reject(new Error('Invalid image file'));
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    img.onload = () => {
      resolve({
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
        width: img.width,
        height: img.height,
        sizeFormatted: formatFileSize(imageFile.size)
      });
    };

    img.onerror = () => {
      reject(new Error('Could not read image dimensions'));
    };

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    reader.readAsDataURL(imageFile);
  });
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size string
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Create a thumbnail from an image file
 * @param {File} imageFile - Image file
 * @param {number} size - Thumbnail size (width/height in pixels)
 * @returns {Promise<string>} - Thumbnail data URL
 */
export async function createThumbnail(imageFile, size = 150) {
  return resizeAndProcessImage(imageFile, size, size, 0.7);
}

/**
 * Test the Cloudinary image service
 * @returns {Promise<Object>} - Test result
 */
export async function testImageService() {
  try {
    console.log('🚀 Starting Cloudinary test...');

    // First run debug test
    const debugResult = await debugCloudinaryConnection();
    if (!debugResult.success) {
      throw new Error('All presets failed during debug test. Check console for details.');
    }

    console.log(`✅ Debug test passed with preset: ${debugResult.preset}`);

    // Now test with actual image
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 1, 1);

    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        try {
          const testFile = new File([blob], 'test.png', { type: 'image/png' });
          const url = await uploadImage(testFile);

          console.log('🎉 Cloudinary image upload successful:', url);
          resolve({
            success: true,
            url: url,
            service: 'Cloudinary',
            cloudName: CLOUDINARY_CLOUD_NAME,
            workingPreset: debugResult.preset
          });
        } catch (error) {
          console.error('❌ Image upload failed:', error);
          reject(error);
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

/**
 * Debug function to test Cloudinary connection
 */
async function debugCloudinaryConnection() {
  console.log('🔍 Testing Cloudinary connection...');
  console.log('Cloud Name:', CLOUDINARY_CLOUD_NAME);
  console.log('Available Presets:', CLOUDINARY_UPLOAD_PRESETS);

  // Test with a simple text file first
  const testBlob = new Blob(['test'], { type: 'text/plain' });
  const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });

  for (const preset of CLOUDINARY_UPLOAD_PRESETS) {
    try {
      console.log(`🧪 Testing preset: ${preset}`);

      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('upload_preset', preset);

      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`;
      console.log('📤 Request URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      console.log(`📥 Response for ${preset}:`, response.status, response.statusText);

      const responseText = await response.text();
      console.log(`📄 Response body for ${preset}:`, responseText);

      if (response.ok) {
        console.log(`✅ Preset ${preset} works!`);
        return { preset, success: true };
      }
    } catch (error) {
      console.error(`❌ Error testing preset ${preset}:`, error);
    }
  }

  return { success: false };
}
