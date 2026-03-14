import Link from "next/link";
import { notFound } from "next/navigation";

import { LAUNCH_PATHS, getLaunchPathBySlug } from "@/lib/launch-paths";

type LaunchPathPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return LAUNCH_PATHS.map((path) => ({ slug: path.slug }));
}

export default async function LaunchPathPage({ params }: LaunchPathPageProps) {
  const { slug } = await params;
  const path = getLaunchPathBySlug(slug);

  if (!path) {
    notFound();
  }

  return (
    <div className="page-enter">
      <section className="card reveal">
        <Link href="/#launch-paths" className="inline-link">Back to Launch Paths</Link>
        <p className="section-label">Launch Path</p>
        <h1 className="section-h2">{path.title}</h1>
        <p className="section-sub">{path.desc}</p>
        <div className="launch-path-head">
          <span className="state-text">Best for: {path.audience}</span>
          <span className="launch-path-eta">{path.eta}</span>
        </div>
      </section>

      <section className="card reveal delay-1">
        <h3 className="section-title">What You Get</h3>
        <ul>
          {path.includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="card reveal delay-2">
        <h3 className="section-title">Expected Outcomes</h3>
        <ul>
          {path.outcomes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="hero-cta-row">
          <Link href="/projects/new">
            <button className="btn-hero">Start This Path</button>
          </Link>
        </div>
      </section>
    </div>
  );
}