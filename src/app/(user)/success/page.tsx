"use client";

import Link from "next/link";
import {
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { logout } from "@/app/utils/login";
import PrimaryButton from "@/app/ui/components/primary_button";
import { auth } from "@/app/utils/firebase_client";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl w-full flex flex-col items-center px-6 gap-8">
      {/* Success icon */}
      <div className="bg-primary/10 rounded-full p-5">
        <CheckCircleIcon className="text-primary" width={56} height={56} />
      </div>

      {/* Heading */}
      <div className="flex flex-col items-center gap-2">
        <h2 className="font-medium text-3xl md:text-4xl text-foreground">
          Ride Requested
        </h2>
        <p className="text-gray-500 text-base md:text-lg">
          We can&apos;t wait to see you in church!
        </p>
      </div>

      {/* Info cards */}
      <div className="w-full flex flex-col gap-4">
        <div className="flex items-start gap-4 border border-tertiary/30 rounded-xl p-5">
          <DevicePhoneMobileIcon
            className="text-primary shrink-0 mt-0.5"
            width={24}
            height={24}
          />
          <p className="text-sm md:text-base text-foreground leading-relaxed">
            We will send you an <span className="font-semibold">SMS</span> with
            your driver&apos;s details on{" "}
            <span className="font-semibold">Sunday morning</span>.
          </p>
        </div>

        <div className="flex items-start gap-4 border border-tertiary/30 rounded-xl p-5">
          <ClockIcon
            className="text-primary shrink-0 mt-0.5"
            width={24}
            height={24}
          />
          <p className="text-sm md:text-base text-foreground leading-relaxed">
            This request is only for this Sunday. To be picked up again next
            week, submit another request by{" "}
            <span className="font-semibold">Friday 11:59 PM</span>.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col md:flex-row gap-3">
        <Link
          href="/request"
          className="px-8 py-3 bg-primary text-white rounded flex items-center justify-center"
        >
          Submit Another Request
        </Link>
        <PrimaryButton
          outline
          onClick={async () => {
            await Promise.all([auth.signOut(), logout()]);
            router.push("/");
          }}
        >
          Logout
        </PrimaryButton>
      </div>
    </div>
  );
}
