import { Link } from 'react-router-dom';
export default function LandingPage() {
  return <div className="p-8"><h1 className="text-3xl font-bold">Planora</h1><p>Production-ready calendar platform.</p><Link to="/login">Get Started</Link></div>;
}
