export default function Home() {
    return (
        <main>
            <h1>vibeaudit-cible</h1>
            <p>Application volontairement vulnérable, pour tester un outil d'audit. Données fictives.</p>
            <ul>
                <li><a href="/profile?name=Alice">Profil</a></li>
                <li><a href="/api/go?next=/">Redirection</a></li>
            </ul>
        </main>
    );
}
