/**
 * Photo Upload Service
 * Handles profile photo upload with compression to Firebase Storage
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import { storage, db } from '../config/firebase';

// Compression settings
const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const QUALITY = 0.8;
const MAX_SIZE_MB = 2; // Maximum 2MB after compression

/**
 * Compress image using Canvas (Web) or native APIs
 */
const compressImage = async (
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
 * Pick image from device (Web file input or Native picker)
 */
export const pickImage = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
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
 * Upload profile photo to Firebase Storage
 */
export const uploadProfilePhoto = async (
  userId: string,
  imageUri: string
): Promise<string> => {
  try {
    console.log('📸 Starting photo upload for user:', userId);

    // Compress image
    const compressedBlob = await compressImage(imageUri);

    // Check size
    const sizeMB = compressedBlob.size / 1024 / 1024;
    if (sizeMB > MAX_SIZE_MB) {
      throw new Error(
        `Image too large: ${sizeMB.toFixed(2)}MB. Maximum size is ${MAX_SIZE_MB}MB`
      );
    }

    // Create storage reference
    const fileName = `profile_photos/${userId}_${Date.now()}.jpg`;
    const storageRef = ref(storage, fileName);

    // Upload to Firebase Storage
    console.log('☁️ Uploading to Firebase Storage...');
    await uploadBytes(storageRef, compressedBlob, {
      contentType: 'image/jpeg',
    });

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('✅ Photo uploaded successfully:', downloadURL);

    // Update user document in Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      photoURL: downloadURL,
      photoUpdatedAt: new Date().toISOString(),
    });

    console.log('✅ User profile updated with photo URL');

    return downloadURL;
  } catch (error) {
    console.error('❌ Error uploading photo:', error);
    throw error;
  }
};

/**
 * Delete profile photo from Firebase Storage
 */
export const deleteProfilePhoto = async (userId: string, photoURL: string): Promise<void> => {
  try {
    // Extract storage path from URL
    const urlObj = new URL(photoURL);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
    if (!pathMatch) {
      throw new Error('Invalid photo URL');
    }

    const storagePath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, storagePath);

    // Delete from storage
    await deleteObject(storageRef);
    console.log('🗑️ Photo deleted from storage');

    // Remove from user document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      photoURL: null,
      photoUpdatedAt: new Date().toISOString(),
    });

    console.log('✅ Photo URL removed from user profile');
  } catch (error) {
    console.error('❌ Error deleting photo:', error);
    throw error;
  }
};

/**
 * Get user's current profile photo URL
 */
export const getProfilePhotoURL = async (userId: string): Promise<string | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await import('firebase/firestore').then((firestore) =>
      firestore.getDoc(userRef)
    );

    if (userDoc.exists()) {
      return userDoc.data()?.photoURL || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting photo URL:', error);
    return null;
  }
};
