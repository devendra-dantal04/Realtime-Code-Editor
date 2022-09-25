import React, {useRef, useState, useEffect} from "react";
import ACTIONS from "../Actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const EditorPage = () => {
    const navigate = useNavigate();
    const codeRef = useRef(null);
    const {roomId} = useParams();
    const socketRef = useRef(null);
    const location = useLocation();
    const [clients,setClients] = useState([]);
    

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            const handleErrors = (e) => {
                console.log("Socket error", e);
                toast.error("Socket connection failed, try again later.")
                navigate('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username : location.state ?? "kacha badam"
            });

            // Listening for joined event
            socketRef.current.on(ACTIONS.JOINED, ({clients, username, socketId}) => {
                if(username !== location.state) {
                    toast.success(`${username} joined the room`);
                    console.log(`${username} joined`);
                } 

                setClients(clients);

                socketRef.current.emit(ACTIONS.SYNC_CODE,{
                    code : codeRef.current, socketId
                })
            });

            //Listening for disconnected

            socketRef.current.on(ACTIONS.DISCONNECTED, ({socketId, username}) => {
                toast.success(`${username} left the room.`);

                setClients((prev) => {
                    return prev.filter(client => client.socketId !== socketId);
                })
            });

            
        } 
        init();

        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        }

    }, []);


    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success("Room Id has been copied !")
        }catch(err) {
            toast.error("Could not copy the Room ID");
            console.log(err);
        }
    }

    const leaveRoom = () => {
        navigate('/')
    }



    if(!location.state) {
        return <Navigate to="/"/>
    }

  return <div className="mainWrap">
    <div className="aside">
        <div className="asideInner">
            <div className="logo">
                <img src="/code-sync.png" alt="logo" className="logoImg"/>
            </div>
            <h3>Connected</h3>
            <div className="clientList">
                {clients.map((client)=> (
                    <Client key={client.socketId} username = {client.username}/>
                ))}
            </div>
        </div>

        <button className="btn copyBtn" onClick={copyRoomId}>Copy ROOM ID</button>
        <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
    </div>

    <div className="editorWrap">
        <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => codeRef.current = code}/>
    </div>
  </div>;
};

export default EditorPage;
