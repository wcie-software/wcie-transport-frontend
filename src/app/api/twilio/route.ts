import { NextRequest, NextResponse } from "next/server";

import { Twilio } from "twilio";

const client = new Twilio(
	process.env.TWILIO_API_KEY,
	process.env.TWILIO_API_SECRET, {
		accountSid: process.env.TWILIO_ACCOUNT_SID
	}
);

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const phoneNumber = searchParams.get("phoneNumber");
	
	if (!phoneNumber || !phoneNumber.startsWith("+1")) {
		console.error("Invalid phone number");
		return NextResponse.error();
	}

	try {
		const verification = await client.verify.v2
			.services("VAd7f39acd95fc71a0bfee4d18b44c8802")
			.verifications.create({
				channel: "sms",
				to: phoneNumber,
			});

		return NextResponse.json(verification.toJSON());
	} catch (error) {
		console.error(error);
		return NextResponse.error();
	}
}

export async function POST(request: NextRequest) {
	const { code, phoneNumber }: { code: string, phoneNumber: string } =
		await request.json();

	if (code.length != 6) {
		console.error("Code should have a length of 6");
		return NextResponse.error();
	}

	try {
		const verificationCheck = await client.verify.v2
			.services("VAd7f39acd95fc71a0bfee4d18b44c8802")
			.verificationChecks.create({
				code: code,
				to: phoneNumber
			});

		return NextResponse.json({
			"approved": verificationCheck.status == "approved"
		});
	} catch (error) {
		console.error(error);
		return NextResponse.error();
	}
}