import PostalMime from "postal-mime";

const textEncoder = new TextEncoder();

async function signWebhookPayload(
	payload: string,
	timestamp: string,
	secret: string,
): Promise<string> {
	const key = await crypto.subtle.importKey(
		"raw",
		textEncoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		textEncoder.encode(`${timestamp}.${payload}`),
	);

	return Array.from(new Uint8Array(signature), (byte) =>
		byte.toString(16).padStart(2, "0"),
	).join("");
}

export default {
	async email(message, env): Promise<void> {
		const parsedEmail = await PostalMime.parse(message.raw);
		const payload = JSON.stringify({
			to: message.to,
			from: message.headers.get("from"),
			subject: parsedEmail.subject ?? "",
			html: parsedEmail.html ?? "",
			text: parsedEmail.text ?? "",
		});
		const timestamp = Math.floor(Date.now() / 1000).toString();
		const signature = await signWebhookPayload(
			payload,
			timestamp,
			env.WEBHOOK_SIGNING_SECRET,
		);
		const response = await fetch(env.WEBHOOK_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Webhook-Timestamp": timestamp,
				"X-Webhook-Signature": `sha256=${signature}`,
			},
			body: payload,
		});

		if (!response.ok) {
			throw new Error(
				`Webhook request failed with status ${response.status}: ${await response.text()}`,
			);
		}
	},
} satisfies ExportedHandler<Env>;
