import { query as db } from '../services/db.service.js';

export const uploadImage = async (req, res) => {
  try {
    const { imageData, fileName, altText } = req.body;
    const userId = req.user?.user_id;

    // Validate input
    if (!imageData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image data is required' 
      });
    }

    if (!fileName) {
      return res.status(400).json({ 
        success: false, 
        message: 'File name is required' 
      });
    }

    // Extract MIME type from base64 string if it contains it
    let base64Data = imageData;
    let mimeType = 'image/jpeg'; // default

    if (imageData.includes(';base64,')) {
      const parts = imageData.split(';');
      mimeType = parts[0].replace('data:', '');
      base64Data = imageData.split(',')[1];
    }

    // Validate MIME type
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validMimeTypes.includes(mimeType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid image format. Allowed: JPEG, PNG, GIF, WebP, SVG' 
      });
    }

    // Calculate file size (base64 string is roughly 1.33x the binary size)
    const fileSizeBytes = Math.ceil((base64Data.length * 3) / 4);
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit

    if (fileSizeBytes > maxSizeBytes) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image size exceeds 5MB limit' 
      });
    }

    // Store the full base64 data URL
    const imageUrl = `data:${mimeType};base64,${base64Data}`;

    // Insert into database
    const result = await db(
      `INSERT INTO images (url, file_name, file_type, file_size, alt_text, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING image_id, url, file_name, file_type, created_at`,
      [imageUrl, fileName, mimeType, fileSizeBytes, altText || '', userId || null]
    );

    if (result.rows.length === 0) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to upload image' 
      });
    }

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading image',
      error: error.message 
    });
  }
};

export const getImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const result = await db(
      `SELECT image_id, url, file_name, file_type, created_at 
       FROM images 
       WHERE image_id = $1`,
      [imageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Image not found' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching image',
      error: error.message 
    });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.user?.user_id;

    // Check if image exists
    const imageResult = await db(
      `SELECT image_id FROM images WHERE image_id = $1`,
      [imageId]
    );

    if (imageResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Image not found' 
      });
    }

    // Delete image
    await db(
      `DELETE FROM images WHERE image_id = $1`,
      [imageId]
    );

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting image',
      error: error.message 
    });
  }
};
