import { useEffect } from 'preact/hooks';

export type PageMeta = {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
    ogDescription: string;
    ogTitle?: string;
    ogType?: string;
    robots?: string;
    ogUrl: string;
    structuredData?: Record<string, any>;
};

function updateOrCreateMeta(attribute: string, value: string) {
    const isProperty = attribute.startsWith('og:');
    const attrName = isProperty ? 'property' : 'name';

    const existingMeta = document.querySelector(`meta[${attrName}="${attribute}"]`);
    if (existingMeta) {
        existingMeta.setAttribute(attrName, attribute);
        existingMeta.setAttribute('content', value);
        return;
    }

    document.head.insertAdjacentHTML('beforeend', `<meta ${attrName}="${attribute}" content="${value}" />`);
}

export function usePageMeta(meta: PageMeta) {
    if (typeof window === 'undefined') {
        globalThis.title = meta.title;
        globalThis._meta = meta;
    }

    useEffect(() => {
        document.title = meta.title;

        updateOrCreateMeta('description', meta.description);
        updateOrCreateMeta('keywords', meta.keywords.join(', '));

        updateOrCreateMeta('og:image', meta.ogImage || '/screenshot-large.jpg');
        updateOrCreateMeta('og:description', meta.ogDescription);
        updateOrCreateMeta('og:title', meta.ogTitle || meta.title);
        updateOrCreateMeta('og:type', meta.ogType || 'website');
        updateOrCreateMeta('og:url', meta.ogUrl);

        if (meta.robots) {
            updateOrCreateMeta('robots', meta.robots);
        } else {
            document.querySelector('meta[name="robots"]')?.remove();
        }

        if (meta.structuredData) {
            const existingStructuredData = document.querySelector('script[type="application/ld+json"]');
            if (existingStructuredData) {
                existingStructuredData.remove();
            }
            document.head.insertAdjacentHTML(
                'beforeend',
                `<script type="application/ld+json">${JSON.stringify(meta.structuredData)}</script>`
            );
        }
    }, [meta]);
}
