import Header from "@/app/ui/components/header";

export default function Layout({ children, }: Readonly<{ children: React.ReactNode; }>) {
	return (
		<div className="min-h-screen flex flex-col">
			<Header title="WCIE Transport Admin"></Header>
			<main className="flex flex-1 justify-center items-center">
				<div className="max-w-3xl w-full px-6 m-auto">
					{children}
				</div>
			</main>
		</div>
	);
}