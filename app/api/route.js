// api/counter.js (TEMPORARY MINIMAL TEST)
export default async function handler(req, res) {
  console.log("API route hit!");
  res.status(200).json({ message: "Hello from API!" });
}
