import { isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/app/utils/firebase";

export async function sendEmailLink(email: string): Promise<boolean> {
	try {
		await sendSignInLinkToEmail(auth, email, {
			url: `${process.env.DEBUG_URL ?? "https://transport.wcie.app"}/admin`,
			handleCodeInApp: true,
			// linkDomain: "transport.wcie.app"
		});
	} catch (e) {
		return false;
	}

	return true;
}

export async function signInWithLink(email: string, url: string): Promise<string | undefined> {
	if (isSignInWithEmailLink(auth, url)) {
		const result = await signInWithEmailLink(auth, email, url);
		return result.user.uid;

		// TODO: Handle bad email and expired link
	}
}