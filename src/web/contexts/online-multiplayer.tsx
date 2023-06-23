import React, { Dispatch, useReducer } from 'react';
import { getDefaultMultiplayerState, multiplayerReducer } from '../reducers/multiplayer';
import { NetworkState } from 'web/network';
import { Action } from 'web/actions/multiplayer';

const OnlineMultiplayerContext = React.createContext<[NetworkState, Dispatch<Action>]>([
    getDefaultMultiplayerState(),
    () => {},
]);

export function OnlineMultiplayerDataProvider({ children }) {
    const [state, dispatch] = useReducer(multiplayerReducer, getDefaultMultiplayerState());
    return <OnlineMultiplayerContext.Provider value={[state, dispatch]}>{children}</OnlineMultiplayerContext.Provider>;
}

export function useOnlineMultiplayerData() {
    return React.useContext<[NetworkState, Dispatch<Action>]>(OnlineMultiplayerContext);
}
