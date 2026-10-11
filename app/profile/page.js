// VULN-5
export default function Profile({ searchParams }) {
    const name = searchParams.name || "Visiteur";
    return (
        <div>
            <h1>Profil</h1>
            <div dangerouslySetInnerHTML={{ __html: `<p>Bienvenue ${name}</p>` }} />
        </div>
    );
}
