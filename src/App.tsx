import { useState, useLayoutEffect, useRef, useEffect } from "react";
function App() {
  const [shapes, setShapes] = useState<any[]>([]);
  const [penCurve, setPenCurve] = useState<{ x: number; y: number }[]>([]);
  const [tool, setTool] = useState<string>("line");
  const [drawing, setDrawing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context && shapes.length) {
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        shapes.forEach((shape) => {
          context.beginPath();
          if (shape.type === "line") {
            context.moveTo(shape.x1, shape.y1);
            context.lineTo(shape.x2, shape.y2);
          }
          if (shape.type === "rectangle") {
            context.rect(shape.x1, shape.y1, shape.x2, shape.y2);
          }
          if (shape.type === "pen") {
            shape.curve.forEach((segment: { x: number; y: number }, index: number) => {
              const nextShape = shape.curve[index + 1];
              context.moveTo(segment.x, segment.y);
              context.lineTo(nextShape?.x, nextShape?.y);
            });
          }
          context.stroke();
        });
      }
    }
  }, [shapes]);

  const createNewElement = (x: number, y: number) => {
    let newElement = {};
    if (tool === "line") newElement = { x1: x, y1: y, x2: x, y2: y, type: tool };
    if (["rectangle", "oval"].includes(tool)) {
      newElement = { x1: x, y1: y, x2: 0, y2: 0, type: tool };
    }
    tool !== "pen" ? setShapes((prevShapes) => [...prevShapes, newElement]) : setPenCurve([{ x: x, y: y }]);
  };

  const updateLastElement = (x: number, y: number) => {
    if (!drawing) return;
    if (shapes.length === 0) return;
    if (["rectangle", "oval", "line"].includes(tool)) {
      const lastElementIndex = shapes.length - 1;
      const lastElement = shapes[lastElementIndex];
      if (lastElement.type === "rectangle") {
        const width = x - lastElement.x1;
        const height = y - lastElement.y1;
        const updatedElement = { ...lastElement, x2: width, y2: height };
        const updatedShapes = [...shapes];
        updatedShapes[lastElementIndex] = updatedElement;
        setShapes(updatedShapes);
      } else {
        const updatedElement = { ...lastElement, x2: x, y2: y };
        const updatedShapes = [...shapes];
        updatedShapes[lastElementIndex] = updatedElement;
        setShapes(updatedShapes);
      }
    }
    if (tool === "pen") {
      console.log(x, y);
      setPenCurve((state) => [...penCurve, { x: x, y: y }]);
      console.log(penCurve);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = e;
    createNewElement(clientX, clientY);
    setDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = e;
    updateLastElement(clientX, clientY);
  };

  const handleMouseUp = () => {
    setDrawing(false);
    if (tool === "pen") {
      setShapes([...shapes, { type: "pen", curve: penCurve }]);
      setPenCurve([]);
    }
  };

  return (
    <div className="App">
      <header className="App-header"></header>
      <div className="App-body">
        <canvas
          ref={canvasRef}
          id="canvas"
          width={window.innerWidth / 2}
          height={window.innerWidth / 2}
          style={{ border: "1px solid #000000" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setDrawing(false)}
        />
        <button onClick={() => setTool("line")}>line</button>
        <button onClick={() => setTool("oval")}>oval</button>
        <button onClick={() => setTool("rectangle")}>rectangle</button>
        <button onClick={() => setTool("pen")}>pen</button>
        <button
          onClick={() => {
            setShapes([]);
          }}
        >
          reset
        </button>
      </div>
    </div>
  );
}

export default App;
