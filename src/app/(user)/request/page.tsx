import { redirect, RedirectType } from "next/navigation";
import AddressPage from "@/app/(user)/request/pages/address";
import { LocationDetails, TransportUser, TransportUserSchema } from "@/app/models/user";
import { addDocument, FirestoreCollections, getDocument } from "@/app/utils/firestore";
import { auth } from "@/app/utils/firebase";

export default async function Request() {
	const user = auth.currentUser;
	if (!user) {
		redirect("/login", RedirectType.replace);
	}

	const transportUser = await getDocument(
		FirestoreCollections.Users,
		user.uid,
		TransportUserSchema
	) as TransportUser | null;

	return (
		<div className="max-w-2xl w-full">
			<AddressPage
				defaultAddress={transportUser?.address}
				onSelected={async (id, text) => {
					const res = await fetch(`/api/coordinates?placeId=${id}`);
					const details = LocationDetails.parse(await res.json());

					const transportUser: TransportUser = {
						address: text,
						phone_number: user!.phoneNumber!,
						location_details: details
					};

					await addDocument(
						FirestoreCollections.Users,
						transportUser,
						user!.uid,
					);

					const formURL = "https://wcie.fillout.com/transport";
					const token = await user!.getIdToken();

					const encodedPhone = encodeURIComponent(user!.phoneNumber!);
					const encodedToken = encodeURIComponent(token);
					const encodedName = encodeURIComponent(user!.displayName ?? "")
					const params = `?phone_number=${encodedPhone}&auth_token=${encodedToken}&name=${encodedName}`;

					redirect(formURL + params, RedirectType.replace);
				}
			}/>
		</div>
	);
}
