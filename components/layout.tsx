import Link from 'next/link';

export default function Layout({ children }) {
	return (
		<div className="layout">
			<header>
				<nav>
					<ul>
						<li>
							<Link href="/">
								<a>Home</a>
							</Link>
						</li>
						<li>
							<Link href="/kontakt">
								<a>Kontakt</a>
							</Link>
						</li>
						<li>
							<Link href="/api-docs">
								<a>API</a>
							</Link>
						</li>
						<li>
							<Link href="https://corona.rlp.de/de/service/rechtsgrundlagen/">
								<a>Coronaverordnungen</a>
							</Link>
						</li>
					</ul>
				</nav>
			</header>
			<main>{children}</main>
		</div>
	);
}
