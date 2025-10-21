import { render } from "preact";
import { Switch, Route } from "wouter-preact";

import { Header } from "@components";
import { Home, Login, Logout, NotFound } from "@pages";

import "./styles/reset.css";
import "./styles/font.css";
import "./styles/index.css";

export function App() {
    return (
        <>
            <Header />
            <Switch>
                <Route path="/" component={Home} />
                <Route path="/login" component={Login} />
                <Route path="/logout" component={Logout} />
                <Route path={undefined} component={NotFound} />
            </Switch>
        </>
    );
}

render(<App />, document.getElementById("app")!);
