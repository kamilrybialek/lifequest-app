/**
 * Photo Upload Service
 * Handles profile photo upload with compression and storage in Firestore (base64)
 * No Firebase Storage needed - works with free tier
 */

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import { db } from '../config/firebase';

// Compression settings
const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const QUALITY = 0.8;
const MAX_SIZE_MB = 2; // Maximum 2MB after compression

/**
 * Compress image using Canvas (Web) or native APIs
 */
export const compressImage = async (
  imageUri: string,
  maxWidth: number = MAX_WIDTH,
  maxHeight: number = MAX_HEIGHT,
  quality: number = QUALITY
): Promise<Blob> => {
  if (Platform.OS === 'web') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      // Don't set crossOrigin for data URLs from FileReader
      // img.crossOrigin = 'anonymous';

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            console.log(
              `📸 Image compressed: ${(blob.size / 1024 / 1024).toFixed(2)}MB (${width}x${height})`
            );
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUri;
    });
  } else {
    // For native, we would use expo-image-manipulator here
    // For now, return a placeholder that will be handled by native image picker
    throw new Error(
      'Native image compression requires expo-image-manipulator. Please install: expo install expo-image-manipulator'
    );
  }
};

/**
 * Convert Blob to base64 data URL
 */
const blobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Pick image from device (Web file input or Native picker)
 */
export const pickImage = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      // Accept JPEG, PNG, and HEIC (iPhone images)
      input.accept = 'image/jpeg,image/jpg,image/png,image/heic,image/heif';

      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          console.log('📸 File selected:', file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`);

          // Check file type
          if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
            console.warn('⚠️ HEIC format detected - will attempt conversion via Canvas');
          }

          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            console.log('✅ File read successfully, data URL length:', dataUrl?.length);
            resolve(dataUrl);
          };
          reader.onerror = (error) => {
            console.error('❌ FileReader error:', error);
            resolve(null);
          };
          reader.readAsDataURL(file);
        } else {
          resolve(null);
        }
      };

      input.click();
    });
  } else {
    // For native, user needs to install expo-image-picker
    // Example code (commented out):
    /*
    const { ImagePicker } = require('expo-image-picker');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
    */
    throw new Error(
      'Native image picking requires expo-image-picker. Please install: expo install expo-image-picker'
    );
  }
};

/**
 * Upload profile photo to Firestore (as base64)
 * No Firebase Storage needed - works with free tier
 */
export const uploadProfilePhoto = async (
  userId: string,
  imageUri: string
): Promise<string> => {
  try {
    console.log('📸 Starting photo upload for user:', userId);

    // Step 1: Compress image
    console.log('🔄 Compressing image...');
    const compressedBlob = await compressImage(imageUri);
    const sizeMB = compressedBlob.size / 1024 / 1024;
    console.log(`✅ Compression done: ${sizeMB.toFixed(2)}MB`);

    // Check size (should be < 0.5MB for Firestore base64 storage)
    if (sizeMB > 0.5) {
      throw new Error(
        `Image too large: ${sizeMB.toFixed(2)}MB. Please use a smaller image or lower quality.`
      );
    }

    // Step 2: Convert blob to base64 data URL
    console.log('🔄 Converting to base64...');
    const base64DataUrl = await blobToBase64(compressedBlob);
    console.log(`✅ Base64 conversion done: ${(base64DataUrl.length / 1024).toFixed(2)}KB`);

    // Step 3: Store in Firestore user document
    console.log('💾 Saving to Firestore...');
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      photoURL: base64DataUrl,
      photoUpdatedAt: new Date().toISOString(),
    });

    console.log('✅ Photo saved to Firestore');
    return base64DataUrl;
  } catch (error) {
    console.error('❌ Error uploading photo:', error);
    throw error;
  }
};

/**
 * Delete profile photo from Firestore
 */
export const deleteProfilePhoto = async (userId: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting photo for user:', userId);

    // Remove from user document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      photoURL: null,
      photoUpdatedAt: new Date().toISOString(),
    });

    console.log('✅ Photo removed from Firestore');
  } catch (error) {
    console.error('❌ Error deleting photo:', error);
    throw error;
  }
};

/**
 * Get user's current profile photo URL (base64 data URL from Firestore)
 */
export const getProfilePhotoURL = async (userId: string): Promise<string | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data()?.photoURL || null;
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting photo URL:', error);
    return null;
  }
};
