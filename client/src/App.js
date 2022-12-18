import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import axios from "axios";

const App = () => {
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const stripRef = useRef(null);
  const colorRef = useRef(null);
  const [type, setType] = useState('Null');
  const [transmitting, setTransmitting] = useState(false)

  useEffect(() => {
    getVideo();
  }, [videoRef]);

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then(stream => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        console.error("error:", err);
      });
  };

  const paintToCanvas = () => {
    let video = videoRef.current;
    let photo = photoRef.current;
    let ctx = photo.getContext("2d");

    const width = 320;
    const height = 240;
    photo.width = width;
    photo.height = height;

    return setInterval(() => {
      let color = colorRef.current;

      ctx.drawImage(video, 0, 0, width, height);
      let pixels = ctx.getImageData(0, 0, width, height);

      color.style.backgroundColor = `rgb(${pixels.data[0]},${pixels.data[1]},${pixels.data[2]
        })`;
      color.style.borderColor = `rgb(${pixels.data[0]},${pixels.data[1]},${pixels.data[2]
        })`;
    }, 200);
  };

  const send = async (data) => {
    try {
      setType("Loading");
      const res = await axios.post("http://localhost:5000", { data: data });
      setType(res.data);
    } catch (e) {
      console.log(e);
    }
  }

  const takePhoto = () => {
    setTransmitting(!transmitting);
    setTimeout(async ()=>{
      let photo, strip, data;
      if (transmitting) {
        photo = photoRef.current;
        strip = stripRef.current;
        data = photo.toDataURL("image/jpeg");
        const link = document.createElement("a");
        link.href = data;
        link.setAttribute("download", "myWebcam");
        link.innerHTML = `<img src='${data}' alt='thumbnail'/>`;
        strip.insertBefore(link, strip.firstChild);
        await send(data);
      }
    }, 20);

  };

  return (
    <div className="container">
      <div className="webcam-video">
        <button onClick={async()=>await takePhoto()}>{transmitting ? "Stop" : "Start"}</button>
        <video
          onCanPlay={() => paintToCanvas()}
          ref={videoRef}
          className="player"
        />
        <canvas ref={photoRef} className="photo" />
        <p>{type}</p>
        <div className="photo-booth">
          <div ref={stripRef} className="strip" />
        </div>
      </div>
    </div>
  );
};

export default App;
