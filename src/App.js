import React, { useState, useEffect } from "react";
import io from 'socket.io-client';
import axios from "axios";
import "./App.css";

const endpoint = "http://201.241.114.187:3030";
const api = `${endpoint}/api/v1`;

export default function App() {

  // executive data
  const [rut, setRut] = useState('')
  const [name1, setName1] = useState('')
  const [name2, setName2] = useState('')
  const [initData, setInitData] = useState(null)
  const [call, setCall] = useState(null)

  // store modulos
  const [modulos, setModulos] = useState([])

  // Guarda elmodulo donde desea logearse
  const [modulo_id, setModuloId] = useState(null)

  //responses
  const [identifyResult, setIdentifyResult] = useState(null)
  const [registerResult, setRegisterResult] = useState(null)

  //Sockets Estado previo, usado para reconexiones
  const prev_state = {
    modulo_id: Number(modulo_id),
    rut: rut,
    status: 'waiting',
    elapsed: null,
    current: {
      line_id: null,
      timestamp: null,
      number: null,
      prefix: null,
      cuid: null,
      tuid: null,
      ruid: null,
    }
  };

  //Se ejecuta al iniciar la aplicación para buscar los modulos disponibles
  useEffect(() => {
    axios.get(`${api}/modulos`).then(({ data }) => {
      console.log("modulos: ", data)
      setModulos(data)
    })
  }, [])

  // Ingresar con un rut ya registrado
  const identify = () => {
    axios
      .get(`${api}/identify`, {
        params: {
          rut: rut
        }
      })
      .then(({ data }) => {
        setIdentifyResult(data)
      })
      .catch(err => console.log(err));
  };

   // Registrar un nuevo rut
  const register = () => {
    axios
      .post(`${api}/identify`, {
        rut,
        names: {
          name1,
          name2,
        }
      })
      .then(({ data }) => {
        setRegisterResult(data)
      })
      .catch(err => console.log(err));
  };


  // Conectar socket

  const connect = () => {
    const connectionData = JSON.stringify({
      rut,
      modulo_id
    })
    const socket = io.connect(endpoint, {query: "data="+connectionData} );

    socket.on('connect', () => {
      console.log("connected")
    })

    socket.emit('init:modulo', prev_state);

    socket.on('init:modulo', state => {
      console.log('init:modulo: ', state);
      setInitData(state)
    });

    socket.on('ticket:created', data => {
      console.log('ticket:created: ', data);
    });

    socket.on('call:created', data => {
      console.log('call:created: ', data);
      if (data.modulo_id == modulo_id) {
        setCall(data)
      }

    });

  }

  return (
    <div className="App">
      <div className={'block'}>
        <h4>1. Logear / registrar ejecutivo</h4>
        <input
          placeholder={'ingrese su rut'}
          onChange={(e) => setRut(e.target.value)} />
        <button onClick={() => identify()}>Identificarse</button>

        {
          identifyResult &&
          <div className={'identify_result'}>
            {
              identifyResult !== 'mis' &&
              <div>
                {JSON.stringify(identifyResult)}
              </div>
            }

            {
              identifyResult === 'mis' &&
              <div>
                <h5>Ingresa tus datos:</h5>
                <input
                  placeholder={'ingrese su nombre'}
                  onChange={(e) => setName1(e.target.value)} />
                <input
                  placeholder={'ingrese su apellido'}
                  onChange={(e) => setName2(e.target.value)} />
                <button onClick={() => register()}>Registrarse</button>
              </div>
            }

          </div>
        }

      </div>
      <h4>2. Selecionar modulos disponibles</h4>

      {
        (identifyResult &&  identifyResult !== 'mis') &&
        <div>
          <h5>Modulos disponibles:</h5>
          {
            <select onChange={(e) => setModuloId(e.target.value)}>
              {
                modulos.map(mod => (
                  <option
                    key={mod.slug}
                    value={mod.id}>{mod.name}</option>
                ))
              }
            </select>
          }
        </div>
      }
      <h4>3. Conectar socket y subscribirse a atenciones:</h4>
      <div>
        {
          modulo_id &&
          <button onClick={() => { connect()}}>Conectarse</button>
        }
      </div>

      <h4>4. Llamada: </h4>
      <div>
        {call && JSON.stringify(call)}
      </div>
    </div>
  );
}


