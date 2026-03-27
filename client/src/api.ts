export const API_BASE = "http://localhost:8000";

export async function apiCall(method: "GET" | "POST" | "DELETE", endpoint: string, data?: any) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API error ${response.status}: ${text}`);
    }
    return await response.json();
  } catch (error: any) {
    if (error.name === "TypeError") {
      throw new Error("Cannot reach backend on port 8000. Ensure the FastAPI service is running.");
    }
    throw error;
  }
}
