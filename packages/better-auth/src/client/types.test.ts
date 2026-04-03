import { describe, it, expectTypeOf } from "vitest";
import { createAuthClient } from "./vanilla";

describe("Native Client Types", () => {
	const client = createAuthClient({
		baseURL: "http://localhost:3000",
	});

	it("should have native feel for core endpoints", () => {
		expectTypeOf(client.signIn.email).toBeFunction();
		expectTypeOf(client.signUp.email).toBeFunction();
		expectTypeOf(client.revokeSession).toBeFunction();
		
		// This should not have type errors
		client.signIn.email({
			email: "test@example.com",
			password: "password123"
		});
	});

	it("should handle getSession response structure", async () => {
		const res = await client.getSession();
		expectTypeOf(res).toBeObject();
		expectTypeOf(res.data).toBeObject();
	});
});
