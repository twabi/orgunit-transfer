import React, {Fragment, useState} from "react";
import {getInstance} from "d2";
import {Switch, Route} from "react-router-dom";
import App from "./App";

const LoadData = (props) => {

    const [D2, setD2] = React.useState();
    const [initAuth, setInitAuth] = useState(props.auth);
    const [orgUnits, setOrgUnits] = React.useState([]);

    React.useEffect(() => {
        setInitAuth(props.auth);

        getInstance().then((d2) => {
            setD2(d2);
            const orgEndpoint = "organisationUnitGroups.json?fields=id,displayName,organisationUnits&paging=false";

            d2.Api.getApi().get(orgEndpoint).then((response) => {
                console.log(response.organisationUnitGroups);
                var tempArray = [{displayName : "All Stratums", id: "All"}];
                response.organisationUnitGroups.map((item) => {
                    if(item.displayName.includes("Stratum")){
                        tempArray.push(item);
                    }
                })
                setOrgUnits(tempArray);
            })
                .catch((error) => {
                    console.log(error);
                    alert("An error occurred: " + error);
            });
        });

    }, [props]);


    return (
            <Fragment>
                <Switch>
                    <Route path="/"  render={(props) => (
                        <App {...props}
                             auth={initAuth}
                             d2={D2}
                             orgUnits={orgUnits}
                        />
                    )} exact/>
                </Switch>
            </Fragment>
    );
}

export default LoadData;