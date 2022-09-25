import React, {useEffect, useRef} from "react";
import CodeMirror from "codemirror";
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/theme/dracula.css';
import ACTIONS from "../Actions";


const Editor = ({socketRef, roomId, onCodeChange}) => {
    const editorRef = useRef();

    useEffect(() => {
        async function init() {
            editorRef.current = CodeMirror.fromTextArea(document.getElementById('realtime-editor'), {
                mode : {name : 'javascript', json : true},
                theme : 'dracula',
                autoCloseTags : true,
                autoCloseBrackets : true,
                lineNumbers : true
            });

            editorRef.current.on('change', (instance,changes) => {
                const {origin} = changes;
                const code = instance.getValue();
                onCodeChange(code)

                if(origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code
                    })
                }
            });

            // editorRef.current.setValue("console.log('Hello Worl')")
        }

        init();
    }, []);

    useEffect(() => {
        if(socketRef.current) {
            
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({code}) => {
                if(code !== null) {
                    editorRef.current.setValue(code)        
                }
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        }
    }, [socketRef.current])
    
    

  return <textarea id="realtime-editor"></textarea>;
};

export default Editor;
