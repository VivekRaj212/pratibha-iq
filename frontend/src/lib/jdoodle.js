export const runCodeAPI = async ({ code, language }) => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/code/run`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ code, language }),
                signal: controller.signal
            }
        );

        clearTimeout(timeout);

        let data;

        try {
            data = await res.json();
        } catch {
            throw new Error("Invalid response from server");
        }

        if (!res.ok) {
            throw new Error(data?.error || "Execution failed");
        }

        return data;

    } catch (err) {
        return {
            success: false,
            error: err.message
        };
    }
};