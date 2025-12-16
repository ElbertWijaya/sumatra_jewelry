import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { Camera } from 'react-native-vision-camera';

const BOOT_FLAG_KEY = 'perm_boot_done_v1';

export const PermissionsBootstrap: React.FC = () => {
  useEffect(() => {
    const run = async () => {
      try {
        const done = await SecureStore.getItemAsync(BOOT_FLAG_KEY);
        if (done === 'yes') return;

        // Camera & Microphone via Vision Camera
        try { await Camera.requestCameraPermission(); } catch {}
        try { await Camera.requestMicrophonePermission(); } catch {}

        // Media Library (Gallery) via Expo Image Picker
        try {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          // On Android 13+, READ_MEDIA_* is handled; below that, WRITE/READ external storage applies
        } catch {}

        await SecureStore.setItemAsync(BOOT_FLAG_KEY, 'yes');
      } catch {}
    };
    run();
  }, []);
  return null;
};
