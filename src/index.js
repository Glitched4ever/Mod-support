export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method === "POST") {
      try {
        const url = new URL(request.url);
        const filename = url.searchParams.get("filename");
        if (!filename) {
          return new Response("Missing ?filename= parameter", { status: 400 });
        }

        const cleanFilename = filename.replace(/[^a-zA-Z0-9_\-\.]/g, "");
        const fileData = await request.arrayBuffer();

        await env.MODS_BUCKET.put(`mods/${cleanFilename}`, fileData, {
          httpMetadata: { contentType: "application/zip" },
        });

        return new Response(JSON.stringify({ status: "success", file: cleanFilename }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err) {
        return new Response(err.message, { status: 500 });
      }
    }

    return new Response("Only POST uploads allowed", { status: 405 });
  },
};
