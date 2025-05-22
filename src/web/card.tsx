import { ComponentChildren } from 'preact';

export function Card({
    title,
    children,
    className,
}: {
    title: string;
    children?: ComponentChildren;
    className?: string;
}) {
    return (
        <article className={`bg-white border-2 border-black rounded-lg p-2 ${className}`}>
            <h1 className="italic font-bold text-sm">{title}</h1>
            {children}
        </article>
    );
}
