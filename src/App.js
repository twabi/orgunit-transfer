import {Col, Divider, Modal, Progress, Row, TreeSelect} from "antd";
import {useEffect, useState} from "react";
import HeaderBar from "@dhis2/d2-ui-header-bar"
import {Button, Pane, SelectField, Text} from "evergreen-ui";
import './App.css';


var schemaPoint = "https://covmw.com/namistest/api/29/schemas/organisationUnit";
var unitPoint = "https://covmw.com/namistest/api/29/organisationUnits";
function App(props) {

  const [D2, setD2] = useState();
  const [alertModal, setAlertModal] = useState(false);
  const [status, setStatus] = useState(0);
  const [statusText, setStatusText] = useState("normal");
  const [messageText, setMessageText] = useState("Checking stratum...");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [auth, setAuth] = useState(props.auth);
  const [treeMarkets, setTreeMarkets] = useState(props.orgUnits);
  const [treeValue, setTreeValue] = useState();
  const [flattenedUnits, setFlattenedUnits] = useState([]);
  const [unitGroups, setUnitGroups] = useState(props.unitGroups);
  const [selectedInstance, setSelectedInstance] = useState("NamisDemo");
  const [loading, setLoading] = useState(false);

  let extractChildren = x => x.children;
  let flatten = (children, getChildren, level, parent) => Array.prototype.concat.apply(
      children && children.map(x => ({ ...x, level: level || 1, parent: parent || null })),
      children && children.map(x => flatten(getChildren(x) || [], getChildren, (level || 1) + 1, x.id))
  );

  const handleTree = (value, label, extra) => {
    setTreeValue(value)
  };

  const onSelectTree = (value, node) => {
    //setOrgUnit(selectedOrgUnit => [...selectedOrgUnit, node]);
    //setSelectedOrgUnit(node);     vbn
    var children = extractChildren(node);

    if(children === undefined){
      setFlattenedUnits([node]);
    } else if(children.length === 0){
      setFlattenedUnits([node]);
    }else {
      let flat = flatten(extractChildren(node), extractChildren, node.level, node.parent)
          .map(x => delete x.children && x);
      //console.log(flat)
      setFlattenedUnits(flat);
    }
  };

  const handleCancel = () => {
    setAlertModal(false);
  };

  useEffect(() => {
    setUnitGroups(props.unitGroups);
    setAuth(props.auth);
    setD2(props.d2);
    setTreeMarkets(props.orgUnits);

  },[props]);

  const postingUnit = (unit) => {
    console.log(unit);
    if(unit.id == undefined || unit.id == null){

    } else {
      var schemaLoad = {
        "path": unit.path,
        "lastUpdated": unit.lastUpdated,
        "id": unit.id,
        "level": unit.level,
        "created": unit.created,
        "attributeValues": unit.attributeValues,
        "name": unit.name,
        "shortName": unit.shortName,
        "openingDate": unit.openingDate,
        "parent":{
          "id": selectedInstance==="NamisDemo" ? unit.parent.id : unit.parent
        },
        "lastUpdatedBy":{
          "id": unit.lastUpdatedBy.id
        },
        "createdBy":{
          "id": unit.createdBy.id
        },
        "translations": unit.translations
      }


      /*
      var corrLoad = {
        "ancestors": unit.ancestors,
        "attributeValues": unit.attributeValues,
        "created": String(unit.created),
        "dataSets": unit.dataSets,
        "dimensionItem": unit.dimensionItem,
        "dimensionItemType": unit.dimensionItemType,
        "displayFormName": unit.displayFormName,
        "displayName": unit.displayName,
        "displayShortName": unit.displayShortName,
        "id": unit.id,
        "lastUpdated": String(unit.lastUpdated),
        "level": unit.level,
        "name": unit.name,
        "openingDate": String(unit.openingDate),
        "organisationUnitGroups": unit.organisationUnitGroups,
        "parent": unit.parent,
        "path": unit.path,
        "periodOffset": unit.periodOffset,
        "programs": unit.programs,
        "shortName": unit.shortName,
        "translations": unit.translations,
        "lastUpdatedBy":{
          "id": unit.lastUpdatedBy.id
        },
        "createdBy":{
          "id": unit.createdBy.id
        },
      }

      let payload;

      if(selectedInstance === "Correctiveinstance"){
        payload = corrLoad;
      }else {
        payload = schemaLoad;
      }

       */


      //console.log(schemaLoad);
      //console.log(payload);


      fetch(schemaPoint, {
        method: 'POST',
        body: JSON.stringify(schemaLoad),
        headers: {
          'Authorization' : auth,
          'Content-type': 'application/json',
        },
        credentials: "include"

      }).then((response) => {
        console.log(response);
        if(response.status === 200 || response.status === 201){
          setStatus(65);

          fetch(unitPoint, {
            method: 'POST',
            body: JSON.stringify(schemaLoad),
            headers: {
              'Authorization' : auth,
              'Content-type': 'application/json',
            },
            credentials: "include"

          }).then((response) => {

            console.log(response);
            if(response.status === 200 || response.status === 201){
              setTimeout(() => {
                setMessageText("Org Unit posted");
                setStatusText("success");
                setStatus(100);
              }, 2000);

            }else if(response.status === 409){
              setMessageText("Error code: 409. A conflict occurred. ");
              setStatusText("exception");
              setStatus(100);
            } else {
              setMessageText("Unable to post org units due to an error");
              setStatusText("exception");
              setStatus(100);
            }
          }).catch((error) => {
            setMessageText("Unable to update org units due to an error : " + error.message);
            setStatusText("exception");
            setStatus(100);
          });
        }else {
          setMessageText("Unable to post org units due to an error");
          setStatusText("exception");
          setStatus(100);
        } //
      });
    }


  }

  const handleCorrective =()=>{
    console.log(flattenedUnits);

    setLoading(false);
    flattenedUnits.map((unit) => {
      setStatus(10);
      setMessageText("Posting children of " + flattenedUnits[0].displayName);
      setStatusText("normal");
      postingUnit(unit);
    });
  }

  const handleDemo = () => {
    console.log(selectedUnit);
    if(selectedUnit == null){
      alert("no stratum has been selected. Choose a stratum by clicking your choice in the dropdown");
      setLoading(false);
      setAlertModal(false);
    }else{

      setLoading(false);

      var group = unitGroups[unitGroups.findIndex(x => x.id === selectedUnit)]
      console.log(group);

      setStatus(10);
      setMessageText("Posting children of " + group.displayName);
      setStatusText("normal");

      const unitPoint = "organisationUnits.json?paging=false&fields=id,displayName";
      fetch(`https://covmw.com/namisdemo/api/${unitPoint}`, {
        method: 'GET',
        headers: {
          'Authorization' : auth,
          'Content-type': 'application/json',
        },
        credentials: "include"

      }).then(result => result.json()).then((response) =>{

        setStatus(30);
        console.log(response);

        var unitArray = response.organisationUnits;
        console.log(group.displayName, "Dinji stratum");
        var object = unitArray[unitArray.findIndex(x => x.displayName.toLowerCase() === group.displayName.toLowerCase())]
        console.log(object);

        var stratumArray = group.organisationUnits;

        console.log("just before");
        fetch(`https://covmw.com/namisdemo/api/organisationUnits/${object.id}.json?fields=*`, {
          method: 'GET',
          headers: {
            'Authorization' : auth,
            'Content-type': 'application/json',
          },
          credentials: "include"

        }).then(result => result.json()).then((response) => {
          console.log(response);
          postingUnit(response);
          setStatus(32);

        }).then(() => {

          stratumArray.map((child) => {

            setStatus(35);
            if(child === undefined){
            } else {

              const endpoint = `organisationUnits/${child.id}.json?fields=*`;

              fetch(`https://covmw.com/namisdemo/api/${endpoint}`, {
                method: 'GET',
                headers: {
                  'Authorization' : auth,
                  'Content-type': 'application/json',
                },
                credentials: "include"

              }).then(result => result.json()).then((response) => {

                setStatus(50);
                postingUnit(response);

              });
            }

          });
        });


      });


    }
  }

  const handlePost = () => {
    setLoading(true);
    setAlertModal(true);
    if(selectedInstance === "NamisDemo"){
      handleDemo()
    } else {
      handleCorrective();
    }

  }

  return (
      <div className="App">
        <div>
          {D2 && <HeaderBar className="mb-5" d2={D2}/>}
          <Modal visible={alertModal} onOk={()=>{handleCancel()}} onCancel={()=>{handleCancel()}} footer={false}>
            <div className="d-flex flex-column w-100 align-items-center py-4">
              <Text size={800} classname="mb-3">
                <b>{messageText}</b>
              </Text>
              <Progress type="circle" className="mt-3" percent={status} status={statusText}/>
            </div>

          </Modal>
          <div className="mt-5 d-flex justify-content-center align-items-center">
            <Pane
                elevation={1}
                float="left"
                margin={24}
                className="w-75 p-4"
                display="flex"
                background="tint2"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
            >
              <div>
                <h5>
                  <strong>Org Units Transfer</strong>
                </h5>

                <Text size={500}>
                  <strong>Select organizational Unit group</strong>
                </Text>
              </div>

              <Divider className="mx-2" plain/>

              <Row className="w-75 mt-3">
                <Col span={12} className="p-3 text-left">
                  <SelectField width="100%"
                               label="Select DHIS2 Instance"
                               description="Select the instance to transfer orgUnits from"
                               value={selectedInstance}
                               onChange={e => setSelectedInstance(e.target.value)}>
                    {['NamisDemo', 'Correctiveinstance'].map((item) => (
                        <option value={item} selected={selectedInstance === item}>
                          {item}
                        </option>
                    ))}

                  </SelectField>
                </Col>

                <Col span={12} className="p-3 text-left">
                  {selectedInstance === "NamisDemo" ?
                      <SelectField width="100%"
                                   label="Select organization Unit Group"
                                   description="Select the stratum whose children you wish to post"
                                   value={selectedUnit&&selectedUnit.displayName}
                                   onChange={e => setSelectedUnit(e.target.value)}>
                        {unitGroups&&unitGroups.map((unit) => (
                            <option value={unit.id} selected={selectedUnit&&selectedUnit.id === unit.id}>
                              {unit.displayName}
                            </option>
                        ))}

                      </SelectField>
                  :
                      <>
                        <label className="grey-text ml-2">
                          <>Select Organization Unit</>
                          {props.orgUnits.length === 0 ? <div className="spinner-border mx-2 indigo-text spinner-border-sm" role="status">
                            <span className="sr-only">Loading...</span>
                          </div> : null}
                        </label>
                        <TreeSelect
                            style={{ width: '100%' }}
                            value={treeValue}
                            className="mt-2"
                            dropdownStyle={{ maxHeight: 400, overflow: 'auto'}}
                            treeData={treeMarkets}
                            allowClear
                            size="large"
                            placeholder="Please select organizational unit"
                            onChange={handleTree}
                            onSelect={onSelectTree}
                            showSearch={true}
                        />
                      </>
                  }

                </Col>

              </Row>
              <Row className="w-25 mt-4">
                <Col span={24}>
                  <Button appearance="primary" onClick={handlePost}>
                    POST {loading ? <div className="spinner-border mx-2 text-white spinner-border-sm" role="status">
                    <span className="sr-only">Loading...</span>
                  </div> : null}
                  </Button>
                </Col>
              </Row>
            </Pane>
          </div>
        </div>
      </div>
  );
}

export default App;
