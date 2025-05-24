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
        <article className={`bg-white border-2 border-black rounded-lg p-4 md:p-2 ${className}`}>
            <h2 className="italic font-bold text-md md:text-sm">{title}</h2>
            {children}
        </article>
    );
}
