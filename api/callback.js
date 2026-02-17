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

    if (result.error) {
      return res.status(400).json(result)
    }

    const token = result.access_token
    const provider = "github"

    const script = `
      <script>
        (function() {
          function receiveMessage(e) {
            console.log("receiveMessage %o", e);
            window.opener.postMessage(
              'authorization:${provider}:success:${token}',
              e.origin
            );
          }
          window.addEventListener("message", receiveMessage, false);
          window.opener.postMessage(
            'authorization:${provider}:success:${token}',
            '*'
          );
        })()
      </script>
    `

    res.setHeader("Content-Type", "text/html")
    res.send(script)
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }
}
