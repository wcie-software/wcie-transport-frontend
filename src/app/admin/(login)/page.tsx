"use client"

import { EMAIL_LOCALSTORAGE_KEY } from "@/app/utils/constants";
import { auth } from "@/app/utils/firebase_setup/client";
import { isSignInWithEmailLink, onAuthStateChanged, signInWithEmailLink, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import AdminLogin from "@/app/admin/(login)/pages/admin-login";
import NotAnAdminPage from "@/app/admin/(login)/pages/not-an-admin";
import { FirebaseError } from "firebase/app";
import { adminLogin } from "@/app/utils/login";

export default function AdminPage() {
	const router = useRouter();

	const [url, setUrl] = useState("");
	const [email, setEmail] = useState<string | null>("");
	const [state, setState] = useState<"loading" | "login" | "not-an-admin">("loading");

	// Get URL before first paint
	useLayoutEffect(() => {
		setUrl(window.location.href);
		setEmail(localStorage.getItem(EMAIL_LOCALSTORAGE_KEY));
	}, []);

	if (email && url && isSignInWithEmailLink(auth, url)) {
		signInWithEmailLink(auth, email, url).then(async (result) => {
			localStorage.removeItem(EMAIL_LOCALSTORAGE_KEY);

			const idToken = await result.user.getIdToken();
			try {
				const loginSuccessful = await adminLogin(idToken);
				if (loginSuccessful) {
					router.replace("/admin/requests");
				} else {
					auth.signOut();
					setState("not-an-admin");
				}
			} catch (e) {
				if (e instanceof FirebaseError) {
					throw e;
				} else {
					auth.signOut();
					setState("login");
				}
			}
		}).catch((e: unknown) => {
			console.error("Some error occurred: " + e);
			// TODO: Handle bad email and expired link
		});
	} else {
		// TODO: Check if user is already logged in
		if (state !== "login") {
			setState("login");
		}
	}
	
	if (state === "login") {
		return <AdminLogin />;
	} else if (state === "not-an-admin") {
		return <NotAnAdminPage />
	} else {
		return <p>Loading...</p>
	}
}