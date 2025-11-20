"use client"

import { EMAIL_LOCALSTORAGE_KEY } from "@/app/utils/constants";
import { auth } from "@/app/utils/firebase_setup/client";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import AdminLogin from "@/app/admin/(login)/pages/admin-login";
import NotAnAdminPage from "@/app/admin/(login)/pages/not-an-admin";
import { FirebaseError } from "firebase/app";
import { adminLogin, isAdmin } from "@/app/utils/login";

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

	auth.authStateReady().then(async (_) => {
		const user = auth.currentUser;
		if (email && url && isSignInWithEmailLink(auth, url)) {
			try {
				const result = await signInWithEmailLink(auth, email, url);
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
			} catch (e) {
				console.error("Some error occurred: " + e);
				// TODO: Handle bad email and expired link
			}
		} else if (user && await isAdmin()) {
			router.replace("/admin/requests");
		} else {
			setState("login");
		}
	});

	if (state === "not-an-admin") {
		return <NotAnAdminPage />;
	} else if (state === "login") {
		return <AdminLogin />;
	} else {
		return <p>Loading...</p>
	}
}