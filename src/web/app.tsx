import { render } from 'preact';
import { lazy, LocationProvider, ErrorBoundary, Router, Route } from 'preact-iso';

import './app.css';

const Play = lazy(() => import('./pages/play'));
const Levels = lazy(() => import('./pages/levels'));
const NotFound = () => <div>404 - Not Found</div>;

function App() {
    return (
        <LocationProvider>
            <ErrorBoundary>
                <Router>
                    <Route path="/" component={Play} />
                    <Route path="/levels/:page?" component={Levels} />
                    <Route default component={NotFound} />
                </Router>
            </ErrorBoundary>
        </LocationProvider>
    );
}

render(<App />, document.getElementById('app')!);
