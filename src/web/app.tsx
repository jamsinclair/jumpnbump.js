import { hydrate, lazy, prerender as ssr, LocationProvider, ErrorBoundary, Router, Route } from 'preact-iso';
import { PageMeta } from './hooks/page-meta';

import './app.css';

const About = lazy(() => import('./pages/about'));
const Levels = lazy(() => import('./pages/levels'));
const Play = lazy(() => import('./pages/play'));
const Secrets = lazy(() => import('./pages/secrets'));
const NotFound = () => <div>404 - Not Found</div>;

function App() {
    return (
        <LocationProvider>
            <ErrorBoundary>
                <Router>
                    <Route path="/" component={Play} />
                    <Route path="/levels/:page?" component={Levels} />
                    <Route path="/about" component={About} />
                    <Route path="/secrets" component={Secrets} />
                    <Route default component={NotFound} />
                </Router>
            </ErrorBoundary>
        </LocationProvider>
    );
}

if (typeof window !== 'undefined') {
    hydrate(<App />, document.getElementById('app'));
}

function getHeadElements(meta: PageMeta) {
    return [
        { type: 'title', props: { children: meta.title } },
        { type: 'meta', props: { name: 'description', content: meta.description } },
        { type: 'meta', props: { name: 'keywords', content: meta.keywords?.join(', ') } },

        // Open Graph tags
        { type: 'meta', props: { property: 'og:title', content: meta.ogTitle || meta.title } },
        { type: 'meta', props: { property: 'og:description', content: meta.ogDescription } },
        { type: 'meta', props: { property: 'og:type', content: meta.ogType || 'website' } },
        { type: 'meta', props: { property: 'og:url', content: meta.ogUrl } },
        { type: 'meta', props: { property: 'og:image', content: meta.ogImage || '/screenshot-large.jpg' } },

        // Optional robots meta
        ...(meta.robots ? [{ type: 'meta', props: { name: 'robots', content: meta.robots } }] : []),

        // Structured data
        ...(meta.structuredData
            ? [
                  {
                      type: 'script',
                      props: {
                          type: 'application/ld+json',
                          textContent: JSON.stringify(meta.structuredData),
                      },
                  },
              ]
            : []),
    ];
}

export async function prerender() {
    const { html, links } = await ssr(<App />);

    return {
        html,
        links,
        head: {
            title: globalThis.title,
            elements: getHeadElements(globalThis._meta || {}),
        },
    };
}
