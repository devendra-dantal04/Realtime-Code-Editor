import React, {useState} from "react";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [roomId, setRoomId] = useState("");
    const [userName, setUserName] = useState("");

    const navigate = useNavigate();

    const createNewRoom = (e) => {
        e.preventDefault()
        const id = uuidv4();
        setRoomId(id);
        toast.success('Created a new room')
    }

    const joinRoom = () => {
        if(!roomId || !userName) {
            toast.error("ROOM ID & username is required.")
            return;
        } 
        
        //Redirect
        navigate(`/editor/${roomId}`, {
            state : userName,
        })
    }
    
    const handleInputEnter = (e) => {
        if(e.code === 'Enter') {
            joinRoom();
        }
    }

    
  return <div className="homePageWrapper">
    <div className="formWrapper">
        <img className="homePageLogo" src="/code-sync.png" alt="code-sync-logo" />
        <h4 className="mainLabel">Paste Invitation ROOM ID</h4>
        <div className="inputGroup">
            <input type="text" className="inputBox" placeholder="ROOM ID"  value={roomId} onChange={(e) => {setRoomId(e.target.value)}} onKeyUp={handleInputEnter}/>
            <input type="text" className="inputBox" placeholder="USERNAME" value={userName} onChange={(e) => {setUserName(e.target.value)}} onKeyUp={handleInputEnter}/>
            <button className="btn joinBtn" onClick={joinRoom}>Join</button>
            <span className="createInfo">
                If you don't have an invite then create &nbsp;
                <a onClick={createNewRoom} href="/" className="createNewBtn">new room</a>
            </span>
        </div>
    </div>

    <footer>
        <h4>Build with 💖 by <a href="https://github.com/devendra-dantal04">Devendra</a></h4>
    </footer>
  </div>;
};

export default Home;
