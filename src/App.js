import {Col, Divider, Modal, Progress, Row} from "antd";
import {useEffect, useState} from "react";
import HeaderBar from "@dhis2/d2-ui-header-bar"
import {Button, Pane, SelectField, Text, TextInputField} from "evergreen-ui";
import './App.css';

function App(props) {

  const [D2, setD2] = useState();
  const [alertModal, setAlertModal] = useState(false);
  const [status, setStatus] = useState(0);
  const [statusText, setStatusText] = useState("normal");
  const [messageText, setMessageText] = useState("Checking stratum...");
  const [orgUnits, setOrgUnits] = useState(props.orgUnits);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [textValue, setTextValue] = useState(null);
  const [auth, setAuth] = useState(props.auth);

  const handleCancel = () => {
    setAlertModal(false);
  };

  useEffect(() => {
    setAuth(props.auth);
    setD2(props.d2);
    setOrgUnits(props.orgUnits);

  },[props]);

  const handlePost =()=>{

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
              <h5>
                <strong>Org Units Transfer</strong>
              </h5>

              <Text size={500}>
                <strong>Select organizational Unit group</strong>
              </Text>

              {[].length !== 0 ? <div className="spinner-border mx-2 indigo-text spinner-border-sm" role="status">
                <span className="sr-only">Loading...</span>
              </div> : null}

              <Divider className="mx-2" plain/>

              <Row className="w-75 mt-3">
                <Col span={24} className="p-3 text-left">
                  <SelectField width="100%"
                               label="Select organization Unit Group"
                               description="Select the stratum whose children you wish to change"
                               value={selectedUnit&&selectedUnit.displayName}
                               onChange={e => setSelectedUnit(e.target.value)}>
                    {orgUnits&&orgUnits.map((unit) => (
                        <option value={unit.id} selected={selectedUnit&&selectedUnit.id === unit.id}>
                          {unit.displayName}
                        </option>
                    ))}

                  </SelectField>
                </Col>

              </Row>
              <Row className="w-25 mt-4">
                <Col span={24}>
                  <Button appearance="primary" onClick={handlePost}>
                    POST
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
