import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";

const PERMISSION_MESSAGE = "Photo access is needed to upload images.";

export type PickedImage = {
  uri: string;
  width: number;
  height: number;
};

async function requestMediaLibraryPermission(): Promise<boolean> {
  if (Platform.OS === "web") {
    return true;
  }

  const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (existing.granted) {
    return true;
  }

  const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!requested.granted) {
    Alert.alert("Permission required", PERMISSION_MESSAGE);
    return false;
  }

  return true;
}

async function pickFromGallery(options: ImagePicker.ImagePickerOptions): Promise<PickedImage | null> {
  const allowed = await requestMediaLibraryPermission();
  if (!allowed) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
  };
}

/**
 * Pick a square profile photo from the device gallery.
 * Returns a local URI for immediate preview; replace with remote URL after upload.
 *
 * Future backend:
 *   const remoteUrl = await uploadToStorage(picked.uri, { folder: "profiles", userId });
 */
export async function pickProfileImage(): Promise<string | null> {
  const picked = await pickFromGallery({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (!picked) {
    return null;
  }

  // TODO: uploadProfilePhoto(picked.uri) → AWS S3 / Supabase Storage URL
  return picked.uri;
}

/**
 * Pick an image attachment for chat messages.
 * Returns a local URI for immediate preview; replace with remote URL after upload.
 *
 * Future backend:
 *   const remoteUrl = await uploadToStorage(picked.uri, { folder: "chat", conversationId });
 */
export async function pickMessageImage(): Promise<string | null> {
  const picked = await pickFromGallery({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 0.85,
  });

  if (!picked) {
    return null;
  }

  // TODO: uploadChatAttachment(picked.uri) → AWS S3 / Supabase Storage URL
  return picked.uri;
}
