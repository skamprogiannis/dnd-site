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
    const provider = "github"

    // Netlify/Decap CMS expects this specific format to handshake with the popup
    const responseHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Authorizing...</title>
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #161618; color: #ebebec; }
          .container { text-align: center; padding: 2rem; border-radius: 8px; border: 1px solid #393639; background: #1a1a20; }
          .loader { border: 3px solid #393639; border-top: 3px solid #7b97aa; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="loader"></div>
          <h2>Completing Authentication</h2>
          <p id="status">Connecting back to the main window...</p>
        </div>
        <script>
          (function() {
            var token = ${JSON.stringify(token)};
            var provider = ${JSON.stringify(provider)};
            var data = JSON.stringify({ token: token, provider: provider });
            
            function sendMessage() {
              var target = window.opener || window.parent;
              if (!target) {
                document.getElementById('status').innerText = "Error: Opener window lost. Please try again.";
                return false;
              }
              
              console.log("Sending token to main window...");
              
              // Send in standard formats
              target.postMessage("authorization:" + provider + ":success:" + data, "*");
              target.postMessage("authorization:" + provider + ":success:" + token, "*");
              
              return true;
            }

            // Send immediately
            var success = sendMessage();
            
            if (success) {
              document.getElementById('status').innerText = "Authentication successful! Closing...";
              
              // Keep trying for a bit to be sure
              var attempts = 0;
              var interval = setInterval(function() {
                attempts++;
                sendMessage();
                if (attempts > 20) {
                  clearInterval(interval);
                  window.close();
                }
              }, 200);

              // Hard close
              setTimeout(function() {
                window.close();
              }, 2000);
            }
          })()
        </script>
      </body>
      </html>
    `

    res.setHeader("Content-Type", "text/html")
    res.status(200).send(responseHtml)
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }
}
