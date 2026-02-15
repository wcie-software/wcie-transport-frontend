export default function SuccessPage() {
  return (
    <div className="max-w-2xl w-full flex flex-col items-start px-6 gap-4">
      <h2 className="font-medium text-3xl md:text-4xl">Ride Requested</h2>
      <p className="text-base md:text-lg leading-relaxed">
        We will send you an SMS with your driver&apos;s details on Sunday
        morning. We can&apos;t wait to see you in church!
      </p>
      <p className="text-base md:text-lg leading-relaxed">
        This request is only for this Sunday. If you would like to be picked up
        again next Sunday, please make sure to submit another request latest
        Friday 11:59 PM.
      </p>
    </div>
  );
}
