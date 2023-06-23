import React, { SyntheticEvent, useEffect, useState } from 'react';

export const ControlledInput = ({
    value,
    onInput,
    onBlur,
    type = 'text',
    ...passThrough
}: {
    type?: string;
    value: string | undefined;
    onInput?: (event: SyntheticEvent) => void;
    onBlur?: (event: SyntheticEvent) => void;
    [key: string]: unknown;
}) => {
    const _onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const fakeEvent = { target: { value: event.target.value } };
        onInput?.(fakeEvent as unknown as SyntheticEvent);
        event.target.value = value ?? '';
    };

    return <input {...passThrough} type={type} value={value} onInput={_onInput} onBlur={onBlur} />;
};
