import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const endpoint = "http://201.241.114.187:3030";
const api = `${endpoint}/api/v1`;

export default function App() {

  // executive data
  const [rut, setRut] = useState('')
  const [name1, setName1] = useState('')
  const [name2, setName2] = useState('')

  // store modulos
  const [modulos, setModulos] = useState([])

  // Guarda elmodulo donde desea logearse
  const [modulo, setModulo] = useState(null)

  //responses
  const [identifyResult, setIdentifyResult] = useState(null)
  const [registerResult, setRegisterResult] = useState(null)

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

  console.log("modulo: ", modulo)

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
            <select onChange={(e) => setModulo(e.target.value)}>
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
      <h4>3. Suscribirse a atenciones</h4>
    </div>
  );
}


