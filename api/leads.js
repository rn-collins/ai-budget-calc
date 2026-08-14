export default function handler(req, res) {
  res.setHeader('Allow', 'GET');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({
    status: 'disabled',
    message: 'This site no longer accepts lead submissions. Calculator inputs remain local to the browser.'
  });
}
