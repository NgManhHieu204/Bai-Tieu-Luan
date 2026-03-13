import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [str1, setStr1] = useState("BACDB");
  const [str2, setStr2] = useState("BDCB");
  const [matrix, setMatrix] = useState([]);
  const [path, setPath] = useState([]); 
  const [activePath, setActivePath] = useState([]); 
  const [lcsResult, setLcsResult] = useState("");
  const [dims, setDims] = useState({ m: 0, n: 0 });
  
  // Dùng Ref để lưu trữ ID của vòng lặp
  const intervalRef = useRef(null);

  const handleVisualize = async () => {
    // Dọn dẹp sạch sẽ vòng lặp cũ nếu đang chạy
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Reset trạng thái
    setMatrix([]);
    setActivePath([]);
    setLcsResult("");

    try {
      const response = await fetch('http://localhost:8000/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ str1, str2 })
      });
      const data = await response.json();

      setDims({ m: data.m, n: data.n });
      setMatrix(data.matrix);
      setPath(data.path);
      setLcsResult(data.lcs);

      // Chạy Animation mới
      runAnimation(data.path);

    } catch (error) {
      console.error("Lỗi kết nối Backend:", error);
      alert("Lỗi: Kiểm tra xem Docker Backend đã chạy chưa!");
    }
  };

  const runAnimation = (fullPath) => {
    let currentStep = 0;
    
    // Lưu ID interval vào Ref để quản lý
    intervalRef.current = setInterval(() => {
      if (currentStep >= fullPath.length) {
        clearInterval(intervalRef.current);
        return;
      }
      
      // Chỉ thêm vào nếu điểm đó tồn tại (không bị undefined)
      const nextPoint = fullPath[currentStep];
      if (nextPoint) {
        setActivePath(prev => [...prev, nextPoint]);
      }
      
      currentStep++;
    }, 200);
  };

  // Hàm kiểm tra style cho ô
  const getCellClass = (i, j) => {
    // Thêm kiểm tra để đảm bảo p không rỗng
    const point = activePath.find(p => p && p.r === i && p.c === j);
    if (point) {
      return point.type === 'match' ? 'cell trace-match' : 'cell trace-path';
    }
    return 'cell';
  };

  return (
    <div className="App">
      <h1>LCS Visualizer (Quy hoạch động)</h1>
      
      <div className="input-group">
        <input 
          value={str1} 
          onChange={(e) => setStr1(e.target.value.toUpperCase())} 
          placeholder="Chuỗi 1"
        />
        <input 
          value={str2} 
          onChange={(e) => setStr2(e.target.value.toUpperCase())} 
          placeholder="Chuỗi 2"
        />
        <button onClick={handleVisualize}>Chạy Demo</button>
      </div>

      {lcsResult && <h2>Kết quả LCS: <span style={{color: '#4caf50'}}>{lcsResult}</span></h2>}

      {matrix.length > 0 && (
        <div 
          className="matrix-container"
          style={{ gridTemplateColumns: `repeat(${dims.n + 2}, 45px)` }} 
        >
          {/* Hàng tiêu đề */}
          <div className="cell header">#</div>
          <div className="cell header">Ø</div>
          {str2.split('').map((char, index) => (
            <div key={`head-${index}`} className="cell header">{char}</div>
          ))}

          {}
          {matrix.map((row, i) => (
            <React.Fragment key={`row-${i}`}>
              <div className="cell header">
                {i === 0 ? 'Ø' : str1[i - 1]}
              </div>
              
              {row.map((val, j) => (
                <div 
                  key={`${i}-${j}`} 
                  className={getCellClass(i, j)}
                >
                  {val}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

export default App;