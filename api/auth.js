export default function handler(req, res) {
  const { provider } = req.query

  if (!provider || provider !== "github") {
    return res.status(400).send("Missing or invalid provider")
  }

  const client_id = process.env.GITHUB_CLIENT_ID
  const scope = "repo,user"

  const protocol = req.headers["x-forwarded-proto"] || "https"
  const host = req.headers.host
  const redirect_uri = `${protocol}://${host}/api/callback`

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}`

  res.redirect(authUrl)
}
