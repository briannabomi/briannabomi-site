import Link from "next/link";

export default function HomePage() {
  return (
    <main className="route-home">
      <div className="route-home__card">
        <p className="eyebrow">Brianna Bomi</p>
        <h1>Welcome</h1>
        <p>The main Brianna Bomi offer will live here.</p>
        <Link className="button button--primary" href="/sexbydesign">
          Visit Sex by Design
        </Link>
      </div>
    </main>
  );
}
