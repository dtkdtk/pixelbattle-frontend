import { render } from "preact";
import { Suspense } from "react";
import { Switch, Route } from "wouter-preact";

import { Home, Login, Logout, NotFound } from "@pages";

import "./styles/reset.css";
import "./styles/font.css";
import "./styles/index.css";

export function App() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Switch>
                <Route path="/" component={Home} />
                <Route path="/login" component={Login} />
                <Route path="/logout" component={Logout} />
                <Route path={undefined} component={NotFound} />
            </Switch>
        </Suspense>
    );
}

render(<App />, document.getElementById("app")!);
