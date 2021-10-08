import React, {Fragment, useState} from "react";
import {getInstance} from "d2";
import {Switch, Route} from "react-router-dom";
import App from "./App";

//initializing an array-to-tree library that will turn an array of org units into a tree form
var arrayToTree = require("array-to-tree");
const LoadData = (props) => {

    const [D2, setD2] = React.useState();
    const [initAuth, setInitAuth] = useState(props.auth);
    const [orgUnits, setOrgUnits] = React.useState([]);

    React.useEffect(() => {
        setInitAuth(props.auth);

        getInstance().then((d2) => {
            setD2(d2);
            const unitEndpoint = "organisationUnits.json?paging=false&fields=*";
            const orgEndpoint = "organisationUnitGroups.json?fields=id,displayName,organisationUnits&paging=false";

            d2.Api.getApi().get(unitEndpoint).then((response) => {
                var tempArray = []
                response.organisationUnits.map((item, index) => {
                    //
                    if(item.level === 1 || item.level === 2){
                        console.log("not this");
                    } else {
                        //making sure every org unit has a parent node, if not set it to undefined
                        item.title = item.name;
                        item.value = item.name.replace(/ /g, "") + "-" + index;
                        if(item.parent != null){
                            //console.log(item.parent.id)
                            item.parent = item.parent.id
                        } else {
                            item.parent = undefined
                        }
                        tempArray.push(item);
                    }
                });

                //do the array-to-tree thing using the parent and id fields in each org unit
                var tree = arrayToTree(tempArray, {
                    parentProperty: 'parent',
                    customID: 'id'
                });

                console.log(tree);
                setOrgUnits(tree)
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