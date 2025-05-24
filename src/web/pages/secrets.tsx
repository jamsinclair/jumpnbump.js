import { Card } from '../components/card';
import { Layout } from '../layout';
import { PageMeta, usePageMeta } from '../hooks/page-meta';

const secretsPageMeta: PageMeta = {
    title: "Jump 'n Bump Secrets",
    description: "Shush. Don't tell anyone, but there are some hidden secrets in the Jump 'n Bump Video Game.",
    keywords: ["Jump 'n Bump", 'secrets', 'hidden', ' Easter eggs'],
    robots: 'noindex, nofollow',
    ogImage: '/screenshot-large.jpg',
    ogDescription: "Shush. Don't tell anyone, but there are some hidden secrets in the Jump 'n Bump Video Game.",
    ogTitle: "Jump 'n Bump Secrets",
    ogType: 'website',
    ogUrl: 'https://jumpnbump.net/secrets',
};

export default function About() {
    usePageMeta(secretsPageMeta);

    return (
        <Layout title="Secrets">
            <Card title="Jump 'n Bump Secrets" className="w-full text-center text-xs pb-3">
                <p className="mt-3">These are the secrets in the game.</p>
                <p>They are pretty impossible to find on your own,</p>
                <p>but now you know them and don't have to ask us anymore! :)</p>
                <p className="mt-3">During gameplay, type in one or more of these toggles:</p>
                <p className="font-bold">jetpack</p>
                <p className="font-bold">pogostick</p>
                <p className="font-bold">lordoftheflies</p>
                <p className="font-bold">bunniesinspace</p>
                <p className="font-bold">bloodisthickerthanwater</p>
                <p className="mt-3">
                    <a href="/" className="text-brainchild-secondary font-bold">
                        Back
                    </a>
                </p>
            </Card>
        </Layout>
    );
}
