import * as React from "react";
import { useSelector } from "react-redux";
import { v4 as uID } from "uuid";
import { Redirect, Route, Switch } from "react-router-dom";

import Routes from "../routes/routes";
import Header from "../components/Header/Header";



const AppRoute = () => {
    const { isAuthenticated } = useSelector(state => state.auth);
    return isAuthenticated ? <ProtectRoutes /> : <GuestRoutes />;
}

const GuestRoutes = () => {
    return (
        <Switch>
            {window && Routes.guest.map((page) => (
                <Route exact={page.exact} path={page.path} component={page.component} key={uID()} />
            ))}
            <Redirect to="/login" />
        </Switch>
    )
}
const ProtectRoutes = () => {

    return (
        <>
            <Header />
            <main>
                <Switch>
                    {window && Routes.protected.map((page) => (
                        <Route exact={page.exact} path={page.path} component={page.component} key={uID()} />
                    ))}
                    <Redirect to="/projects" />
                </Switch>
            </main>
        </>
    )
}

export default AppRoute;
