import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useSiteData(key: string, defaultValue: string = '') {
    const [value, setValue] = useState(defaultValue);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!key) return;
        const docRef = doc(db, 'site_data', key);
        
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setValue(docSnap.data().value);
            } else {
                // Fallback to local storage if not in DB yet
                const local = localStorage.getItem(key);
                if (local) {
                    setValue(local);
                } else {
                    setValue(defaultValue);
                }
            }
            setLoading(false);
        }, (err) => {
            console.error("Failed to load site data", err);
            // Fallback to local storage on error
            const local = localStorage.getItem(key);
            if (local) setValue(local);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [key, defaultValue]);

    const setSiteData = async (newValue: string) => {
        setValue(newValue);
        localStorage.setItem(key, newValue); // Keep local storage as backup
        try {
            await setDoc(doc(db, 'site_data', key), { value: newValue });
        } catch (err) {
            console.error("Failed to save to firestore", err);
        }
    };

    return [value, setSiteData, loading] as const;
}
