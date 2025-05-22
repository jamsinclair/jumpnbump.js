import { Card } from '../card';
import { Layout } from '../layout';

export function About() {
    return (
        <Layout title="About">
            <Card title="Jump 'n Bump" className="w-97 h-64 flex-shrink-0"></Card>
            <div className="flex flex-col w-full gap-2">
                <Card title="Play Online"></Card>
                <Card title="Download Game"></Card>
            </div>
        </Layout>
    );
}
