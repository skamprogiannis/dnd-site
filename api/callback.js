export default async function handler(req, res) {
  const { code } = req.query

  if (!code) {
    return res.status(400).send("Missing code")
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const result = await response.json()

    if (result.error || !result.access_token) {
      console.error("GitHub Auth Error:", result)
      return res
        .status(400)
        .send("GitHub Authentication failed: " + (result.error_description || "No token received"))
    }

    const token = result.access_token

    const responseHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Success!</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #161618; color: #ebebec; }
          .container { text-align: center; padding: 2rem; border-radius: 8px; border: 1px solid #393639; background: #1a1a20; max-width: 400px; }
          .checkmark { color: #4ade80; font-size: 48px; margin-bottom: 1rem; }
          .info { color: #9eb2c0; font-size: 14px; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="checkmark">✓</div>
          <h2>Authentication Successful!</h2>
          <p>You can now close this window.</p>
          <p class="info">The editor should update automatically...</p>
        </div>
        <script>
          (function() {
            var token = ${JSON.stringify(token)};
            var data = JSON.stringify({ token: token, provider: "github" });
            
            // Write to sessionStorage for the main window to pick up
            try {
              sessionStorage.setItem('decap_auth_token', data);
              sessionStorage.setItem('decap_auth_time', Date.now().toString());
            } catch(e) {
              console.error("sessionStorage error:", e);
            }

            // Try postMessage to opener
            var targets = [window.opener, window.parent, top];
            targets.forEach(function(target) {
              if (target && target !== window) {
                try {
                  target.postMessage("authorization:github:success:" + data, "*");
                } catch(e) {}
              }
            });

            // Close after a short delay
            setTimeout(function() {
              window.close();
            }, 2000);
          })()
        </script>
      </body>
      </html>
    `

    res.setHeader("Content-Type", "text/html")
    res.status(200).send(responseHtml)
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error: " + error.message)
  }
}
