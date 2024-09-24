import { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import './App.css';
import MyElement3D from './MyElement3DCanvas';

const WS_SERVER_URL = '/ws';  // 자바 서버의 WebSocket 포트

function App() {
  const [data, setData] = useState([]);
  const [selectedOption, setSelectedOption] = useState('Euler');
  const [webSocket, setWebSocket] = useState(null); // Store the WebSocket instance
 
  // var webSocket;

  useEffect(() => {
    // 웹소켓 클라이언트 초기화
    const webSocket = new WebSocket(WS_SERVER_URL);
    setWebSocket(webSocket)

    webSocket.onopen = () => {
      console.log('Connected to WebSocket server');
      // webSocket.send("testtt")
    };

    // 데이터 수신
    webSocket.onmessage = (event) => {
      
      const newData = JSON.parse(event.data);
      setData(Object.values(newData));
      // console.log('Received data from server:', newData);
    };

    webSocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    webSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // 컴포넌트 언마운트 시 웹소켓 연결 종료
    return () => {
      webSocket.close();
    };
  }, [])
  


  // 버튼 클릭 (추후 수정)
  const btnAction = () => {
    console.log('Button c0licked!');
  };


  // 리셋 버튼 클릭시
  const sendReset = () => {
    console.log('리셋버튼 클릭');
    
    webSocket.send("reset");

  };


  // TODO: 추후 수정
  const handleRadioChange = (event) => {
    setSelectedOption(event.target.value);
    if (event.target.value === 'Euler') {
      // testdata = JSON.parse(JSON.stringify(mockData));
      
      console.log('Button c0licked3!', data)
      // testdata = JSON.parse(JSON.stringify(data));
      // testdata = data;
    } else {    
      // console.log('Button c0licked2!', data)
      // console.log('Button c0licked2!', alternateData)
      // console.log('Button c0licked2!',  JSON.parse(JSON.stringify(data)))
      // console.log('Button c0licked2!',  JSON.parse(JSON.stringify(alternateData)))
      // console.log('-----------------------------')

      for(let sensor in data) {
        const datas = data[sensor]; // 각 센서의 데이터
        console.log(`Sensor: ${sensor}`);
        console.log(`Value: ${datas.id}`);
      }
      
      
      console.log('+++++++++++++++++++++++++++++++++')
      
      // testdata = [JSON.parse(JSON.stringify(alternateData))];
      // testdata = JSON.parse(JSON.stringify(data));
      // testdata = data;
    }
  };



  return (
    <>
      <div className="canvas-container">
        <div className="button-container">
          <button onClick={sendReset} className='button'>Reset</button>
        </div>
        {/* <Canvas camera={{ position: [2, 2, 5], fov: 500 }}> */}
        <Canvas camera={{ position: [0, 0, 7], fov: 100 }}>
          <MyElement3D data={data} />
        </Canvas>
      </div>
      <div className="table-container">
        <div className='parent'>
          <button onClick={btnAction} className='child'>Connect</button>
          <button onClick={btnAction} className='child'>Start</button>
        </div>
        <div className='radio-container'>
          <label>
            <input 
              type="radio" 
              value="Euler" 
              checked={selectedOption === 'Euler'} 
              onChange={handleRadioChange} 
            />
            Euler
          </label>
          <label>
            <input 
              type="radio" 
              value="Quaternion" 
              checked={selectedOption === 'Quaternion'} 
              onChange={handleRadioChange} 
            />
            Quaternion
          </label>
        </div>
        <table>
          <thead>
            <tr>
              <th>Sensor</th>
              <th>W</th>
              <th>X</th>
              <th>Y</th>
              <th>Z</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
                <tr key={item.id}>
                  {/* {condition ? <td>{index}</td> : null} */}
                  <td>{index}</td>
                  <td>{item.w}</td>
                  <td>{item.x}</td>
                  <td>{item.y}</td>
                  <td>{item.z}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      
    </>
  );
}

export default App;
