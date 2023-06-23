import React, { useEffect, useRef } from 'react';
import './alert.css';
import { GameAlert } from '../network';
import { CloseIcon } from './close-icon';

export function Alert({ alert, close }: { alert: GameAlert; close: () => void }) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const dismissDialog = (e?: unknown) => {
        if (e instanceof KeyboardEvent && e.key !== 'enter' && e.key !== 'escape') return;

        if (dialogRef.current && dialogRef.current.open) {
            dialogRef.current.close();
            close();
        }
    };

    useEffect(() => {
        let current: HTMLDialogElement | null = null;
        if (dialogRef.current) {
            current = dialogRef.current;
            current.showModal();
            current.addEventListener('close', dismissDialog);
        }
        return () => {
            if (current) {
                current.removeEventListener('close', dismissDialog);
            }
        };
    }, [dialogRef]);

    return (
        <dialog className={`alert-${alert.type}`} ref={dialogRef}>
            <h2 className="alert-title">{alert.title}</h2>
            <p className="alert-content">{alert.content.toString()}</p>
            {alert.type === 'error' ? (
                <p>
                    Feel free to create an issue report on{' '}
                    <a href="https://github.com/jamsinclair/jumpnbump.js/issues/new">
                        github.com/jamsinclair/jumpnbump.js
                    </a>
                </p>
            ) : null}
            <button
                className="alert-close-button"
                onClick={dismissDialog}
                onKeyDown={dismissDialog}
                aria-label="Close dialog"
            >
                <CloseIcon />
            </button>
        </dialog>
    );
}
