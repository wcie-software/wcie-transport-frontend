import PrimaryButton from "@/app/ui/components/primary_button";
import Link from "next/link";

export default function AdminLogin() {
	return (
		<div className="max-w-2xl w-full px-6 m-auto">
			<div className="flex flex-col">
				<p className="text-lg font-semibold">Enter Your Email</p>
				<p className="text-gray-400">We will send you a code.</p>
			</div>
			<form className="flex flex-col items-start gap-4">
				<input 
					type="email"
					name="email"
					placeholder="name@gmail.com"
					required
					className="outline-0 placeholder-gray-500 truncate w-full text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold"/>
				<PrimaryButton
					text="Login"
					type="submit" />
			</form>
		</div>
	);
}