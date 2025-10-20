import Link from "next/link";

export default function Home() {
	return (
		<div className="max-w-2xl w-full flex flex-col items-start px-6">
			<h2 className="font-medium text-3xl md:text-4xl font-[family-name:var(--font-mont)]">
				Request A Ride To Winners Chapel Int'l Edmonton
			</h2>
			{/* <p className="mt-1">It's free.</p> */}
			<div className="mt-5 flex flex-row gap-6 items-center justify-between">
				<Link
					href="/request"
					className="bg-primary px-8 py-3 rounded cursor-pointer disabled:bg-gray-500 disabled:cursor-default">
					Login
				</Link>
				{/* <Link href="/admin" className="truncate">Admin Login</Link> */}
			</div>
		</div>
	);
}
