
"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/lib/types";

const STORAGE_KEY = "finvoice_profile";

const defaultProfile: UserProfile = {
  name: "Alex Doe",
  email: "alex.doe@example.com",
  phone: "123-456-7890",
  dob: "1990-01-01",
  profilePicture: "https://placehold.co/128x128.png",
};


export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        setProfile(JSON.parse(item));
      } else {
        // If no profile in storage, set the default one
        setProfile(defaultProfile);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
      }
    } catch (error) {
      console.error("Failed to load profile from localStorage", error);
      setProfile(defaultProfile);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback((newProfileData: UserProfile) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfileData));
      setProfile(newProfileData);
    } catch (error) {
      console.error("Failed to save profile to localStorage", error);
    }
  }, []);

  return { profile, updateProfile, loading };
}
