import { Link } from 'wouter';
import { Auth } from '../components/Auth';

export function LoginPage() {
  return (
    <main className="container">
      <header className="page-header">
        <Link href="/">AskGrandma</Link>
        <h1>Choose your account</h1>
        <p>After login, find your family member and connect before chatting.</p>
      </header>
      <Auth />
    </main>
  );
}
