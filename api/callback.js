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
        <title>Authorizing...</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #161618; color: #ebebec; }
          .container { text-align: center; padding: 2rem; border-radius: 8px; border: 1px solid #393639; background: #1a1a20; max-width: 400px; }
          .loader { border: 3px solid #393639; border-top: 3px solid #7b97aa; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .success { color: #4ade80; }
          .error { color: #f87171; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="loader" id="loader"></div>
          <h2 id="title">Completing Authentication...</h2>
          <p id="status">Please wait while we connect to the editor.</p>
        </div>
        <script>
          (function() {
            var token = ${JSON.stringify(token)};
            var data = JSON.stringify({ token: token, provider: "github" });
            
            // Try to communicate via sessionStorage (works across windows/tabs)
            try {
              sessionStorage.setItem('decap_auth_token', data);
              sessionStorage.setItem('decap_auth_time', Date.now().toString());
            } catch(e) {
              console.error("sessionStorage not available", e);
            }

            // Try postMessage to various targets
            var targets = [window.opener, window.parent, top];
            var sent = false;
            
            function trySend() {
              targets.forEach(function(target) {
                if (target && target !== window) {
                  try {
                    // Try various message formats
                    target.postMessage("authorization:github:success:" + data, "*");
                    target.postMessage("authorization:github:success:{" + '"token":"' + token + '","provider":"github"}', "*");
                    console.log("Sent to target:", target.location.href);
                    sent = true;
                  } catch(e) {
                    console.log("Failed to send to target:", e.message);
                  }
                }
              });
            }

            trySend();
            
            // Keep trying
            var attempts = 0;
            var interval = setInterval(function() {
              attempts++;
              trySend();
              
              if (sent) {
                document.getElementById('loader').style.display = 'none';
                document.getElementById('title').innerText = 'Success!';
                document.getElementById('title').className = 'success';
                document.getElementById('status').innerText = 'You can close this window now.';
              }
              
              if (attempts > 30) {
                clearInterval(interval);
                document.getElementById('status').innerText = 'If the main window did not update, please check console for errors.';
              }
            }, 200);

            // Also listen for messages asking for the token
            window.addEventListener("message", function(e) {
              if (e.data === "give_me_the_token") {
                e.source.postMessage("here_is_the_token:" + data, e.origin);
              }
            });

            setTimeout(function() {
              window.close();
            }, 8000);
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
