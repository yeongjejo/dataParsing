import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Euler, Quaternion, Vector3 } from "three";
import * as THREE from 'three'; // THREE를 import



var check = false; // data 정상 수신 여부

var prePostion = {}; // 이전 센서 위치

// 센서 포지션 (key: 센서아이디, value[x, y])
const sensorPositionXY = {
    0: [4, 2],
    // 1: [4, 0],
    1: [0, -2],
    3: [8, 0],
    4: [8, 2],
    7: [0, 0],
    8: [0, 2],
    11: [6, 2],
    12: [6, 4],
    13: [6, 6],
    14: [2, 2],
    15: [2, 4],
    16: [2, 6]
}
// 막대로 연결할 센서 id
// 0 : 부모
// 1 : 자식
const stickSensorID = [
    // [1, 3],
    [1, 7],
    // [1, 0],
    // [0, 11],
    // [0, 14],
    // [3, 4],
    [7, 8],
    // [11, 12],
    // [12, 13],
    // [14, 15],
    // [15, 16],
    
]

// 관절 사이를 연결하는 막대 생성 함수
const Stick = ({ start, end }) => {
    const direction = end.clone().sub(start).normalize();
    const length = start.distanceTo(end);
    const midPoint = start.clone().lerp(end, 0.5);


    // 방향에 따라 쿼터니언 계산
    const up = new Vector3(0, 1, 0); // 월드 좌표계에서의 위쪽 방향
    const quaternion = new Quaternion().setFromUnitVectors(up, direction); // 쿼터니언 계산
    

    return (
        <mesh position={midPoint} quaternion={quaternion.normalize()}>
            <cylinderGeometry args={[0.1, 0.1, length, 16]} />
            <meshStandardMaterial color="#ff0000" />
        </mesh>
    );
};

// TODO: 거리 계산 테스트 용도 추후 삭제
function distance3D(point1, point2) {
    /*
    :param point2: 두 번째 점 [x2, y2, z2] 형태의 배열
    :return: 두 점 사이의 거리
    */
    const [x1, y1, z1] = point1;
    const [x2, y2, z2] = point2;

    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
    return distance;
}


// (최상위)부모 관절(들)을 찾기 위한 재귀함수
function findParents(list, key, refList) {
    const parentKey = stickSensorID.find(([start, end]) => end == key)?.[0]; // 현재 센서(key)의 부모 센서를 구함
    if (parentKey != null && refList[parentKey]) {
        list.push(parentKey);
        findParents(list, parentKey, refList);
    }
}


function MyElement3DCanvas({ data }) {
    var refList = {}; // mesh 객체 저장할 리스트

    if (data != null) {
        Object.entries(data).forEach(([key, value]) => { // mesh 선언 (총 16개)
            refList[key] = [useRef(), new Quaternion(value.x, value.y, value.z, value.w).normalize(), new Euler(value.eulerX, value.eulerY, value.eulerZ, 'XYZ')];
        });
        check = true;
    } else {
        check = false;
    }


    // 이전 포지션 저장 및 이전 포지션에서

    useFrame((state, delta) => {
        if (check) {
            // 쿼터니언 적용
            Object.entries(refList).forEach(([key, value]) => {
                if (key in sensorPositionXY && value[0] && value[0].current && value[0].current.quaternion) {
                    value[0].current.quaternion.copy(value[1].normalize()); 
                    value[0].current.position.set(sensorPositionXY[key][0]-4, sensorPositionXY[key][1] * -1 +2.33, 0); // 포지션 설정 (이건 추후 수정?)
                    
                    // FK 적용: 자식 관절의 위치 조정
                    const parentKey = stickSensorID.find(([start, end]) => end == key)?.[0]; // 현재 센서(key)의 부모 센서를 구함
                    if (parentKey != null && refList[parentKey]) {
                        
                        // const parentQuaternion = refList[parentKey][0].current.quaternion.clone(); // 부모 센서의 쿼터니언 각


                        let totalQuaternion = new Quaternion(); // 최상위 부모의 쿼터니언을 저장할 변수
                        totalQuaternion.identity(); // 초기화
                    
                        let currentParentKey = parentKey;
                        // 최상위 부모를 찾으며 쿼터니언을 곱함
                        while (currentParentKey != null && refList[currentParentKey]) {
                            const parentQuaternion = refList[currentParentKey][0].current.quaternion.clone();
                            const parentPosition = refList[currentParentKey][0].current.position.clone(); // 부모 센서의 위치
                            // const relativePosition = value[0].current.position.clone();// 자신(자식) 센서의 위치

                            const relativePosition = value[0].current.position.clone().sub(parentPosition);

                            relativePosition.applyQuaternion(parentQuaternion); // 부모 쿼터니언으로 회전 적용

                                // 부모의 위치에 자식의 상대적 위치를 더함
                            // const newRelativePosition = new Vector3(relativePosition.x-parentPosition.x, relativePosition.y-parentPosition.y, relativePosition.z-parentPosition.z); // 자식의 상대 위치 (자식위치 - 부모위치)
                            // const newRelativePosition = new Vector3(0, 2, 0); // 자식의 상대 위치 (자식위치 - 부모위치)
                            // newRelativePosition.applyQuaternion(parentQuaternion.normalize()); // 부모 쿼터니언으로 회전 적용
                            value[0].current.position.copy(parentPosition).add(relativePosition); // 부모 위치 + 상대 위치    

                            // totalQuaternion.multiply(parentQuaternion); // 쿼터니언 곱셈
                            currentParentKey = stickSensorID.find(([start, end]) => end === currentParentKey)?.[0]; // 다음 부모 찾기
                        }
                    


                        // const parentPosition = refList[parentKey][0].current.position.clone(); // 부모 센서의 위치
                        
                        // // const parentPosition = prePostion[parentKey]; // 부모 센서의 위치
                        // const relativePosition = value[0].current.position.clone();// 자신(자식) 센서의 위치
                        // // const relativePosition = prePostion[key]// 자신(자식) 센서의 위치


                    

                        // // 부모의 위치에 자식의 상대적 위치를 더함
                        // const newRelativePosition = new Vector3(relativePosition.x-parentPosition.x, relativePosition.y-parentPosition.y, relativePosition.z-parentPosition.z); // 자식의 상대 위치 (자식위치 - 부모위치)
                        // // const newRelativePosition = new Vector3(0, 2, 0); // 자식의 상대 위치 (자식위치 - 부모위치)
                        // newRelativePosition.applyQuaternion(totalQuaternion.normalize()); // 부모 쿼터니언으로 회전 적용
                        // value[0].current.position.copy(parentPosition).add(newRelativePosition); // 부모 위치 + 상대 위치                        
                    }

                    // let parentsList = [];
                    // findParents(parentsList, key, refList);

                    // if (parentsList.length != 0) {
                    //     // const parentPosition = refList[parentsList[0]][0].current.position.clone(); // 부모 센서의 위치
                    //     // const relativePosition = value[0].current.position.clone();// 자신(자식) 센서의 위치

                    //     for (const parentKey of [...parentsList].reverse()) {

                            
                    //         const parentPosition = refList[parentsList[0]][0].current.position.clone(); // 부모 센서의 위치
                    //         const relativePosition = value[0].current.position.clone();// 자신(자식) 센서의 위치
                    //         const parentQuaternion = refList[parentKey][0].current.quaternion.clone(); // 부모 센서의 쿼터니언 각

                    //         // 부모의 위치에 자식의 상대적 위치를 더함
                    //         const newRelativePosition = new Vector3(relativePosition.x-parentPosition.x, relativePosition.y-parentPosition.y, relativePosition.z-parentPosition.z); // 자식의 상대 위치 (자식위치 - 부모위치)
                    //         // const newRelativePosition = new Vector3(0, 2, 0); // 자식의 상대 위치 (자식위치 - 부모위치)
                    //         newRelativePosition.applyQuaternion(parentQuaternion.normalize()); // 부모 쿼터니언으로 회전 적용
                    //         value[0].current.position.copy(parentPosition).add(newRelativePosition); // 부모 위치 + 상대 위치     
                    //     }
                    // }

                    console.log(distance3D(refList[7][0].current.position.clone(), refList[8][0].current.position.clone()));
                }
            });


        }
    });

    

    // Quaternion {isQuaternion: true, _x: 0.005424285707380397, _y: 0.0010218567771412173, _z: -0.00006297953725539755, _w: 0.9999847643673726}
    // Vector3 {x: -3.999985729427311, y: 2.3364182614898135, z: 0.008542265350039224}x: -3.999985729427311y: 2.3364182614898135z: 0.008542265350039224[[Prototype]]: Object
    // Vector3 {x: -4, y: 0.33000000000000007, z: 0}


    // Quaternion {isQuaternion: true, _x: 0.00596637005742785, _y: 0.001424348024697493, _z: 0.00016489110221267343, _w: 0.9999811730587566}
    // Vector3 {x: -0.1549360461445679, y: 5.66868241811694, z: 2.197542839755785}
    // Vector3 {x: -4, y: 0.33000000000000007, z: 0}

    return (
        <>
            {/* 조명 설정 */}
            <directionalLight position={[1, 1, 1]} />

            {/* 관절 큐브 생성 */}
            {Object.entries(refList).map(([key, value]) => (
                value[1].w != 1 ? (
                    <mesh key={key} ref={value[0]} rotation-y={45 * Math.PI / 180}>
                        <boxGeometry />
                        <meshStandardMaterial color="#ffcc00" />
                    </mesh>
                ) : null

            ))}

    
            {/* 관절 이을 막대 생성 */}
            {
                stickSensorID.map(([startID, endID, horizontal]) => {
                    if (refList[startID] && refList[endID] && refList[startID][0].current && refList[endID][0].current) {
                        const startPosition = refList[startID][0].current.position;
                        const endPosition = refList[endID][0].current.position;
            
                        // console.log(`Start22 Sensor ID: ${startID}, End Sensor ID: ${endID}`); // 로그 추가
                        
                        // Stick 생성 (이 코드 내에서 Stick 컴포넌트 사용)
                        return <Stick key={`${startID}-${endID}`} start={startPosition} end={endPosition}/>;
                    } else {
                        console.log(`Sensor IDs ${startID} or ${endID} are invalid.`);
                        return null; // 유효하지 않은 경우 null 반환
                    }
                })
            }
            

            
        </>
    );
}

export default MyElement3DCanvas;
