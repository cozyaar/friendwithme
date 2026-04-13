import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const createOrGetUser = async (user) => {
  const userRef = doc(db, "users", user.uid);

  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    // Create new user
    await setDoc(userRef, {
      uid: user.uid,
      phone: user.phoneNumber,
      name: "",
      age: null,
      city: "",
      bio: "",
      interests: [],
      lifestyle: [],
      profilePic: "",
      createdAt: serverTimestamp(),
      profileCompleted: false,
      isRealUser: true
    });

    return {
      isNew: true,
      data: null
    };
  } else {
    return {
      isNew: false,
      data: docSnap.data()
    };
  }
};
