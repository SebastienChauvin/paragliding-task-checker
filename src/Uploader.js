import React, { useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { useState } from 'react';
import { useEffect } from 'react';
const { compress, decompress } = require('shrink-string')

const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa0F',
    color: '#bdbdbd',
    outline: 'none',
    margin: 10,
    transition: 'border .24s ease-in-out'
};

const activeStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

function StyledDropzone(props) {
    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject,
    } = useDropzone({
        onDrop: async acceptedFiles => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                const contents = await file.text();
                props.setter(contents);
            }
        }
    });

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isDragActive ? activeStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isDragActive,
        isDragReject,
        isDragAccept
    ]);

    return (
        <div className="container">
            <div {...getRootProps({ style })}>
                <input {...getInputProps()} />
                <p>{props.message}</p>
            </div>
        </div>
    );
}

const useHash = () => {
    const [hash, setHash] = React.useState(() => window.location.hash);
  
    const hashChangeHandler = React.useCallback(() => {
      setHash(window.location.hash);
    }, []);
  
    React.useEffect(() => {
      window.addEventListener('hashchange', hashChangeHandler);
      return () => {
        window.removeEventListener('hashchange', hashChangeHandler);
      };
    }, []);
  
    const updateHash = React.useCallback(
      newHash => {
        if (newHash !== hash) window.location.hash = newHash;
      },
      [hash]
    );
  
    return [hash, updateHash];
  };

function Uploader(props) {
    const style = {
        ...baseStyle,
        color: "green",
        borderColor: "green"
    };

    const [contents, setContents] = useState();
    const [hash, setHash] = useHash();

    // Sets a new URL when asked
    useEffect(() => {
        props.fileSetter(contents);

        async function computeUrl() {
            let newHash = "";
            if(contents) {
                newHash = await compress(contents)
            }
            setHash(newHash);
        }
        if (props.inUrl) {
            computeUrl();
        }
    }, [contents, props])

    // Loads the contents from a URL
    useEffect(() => {
        async function decodeContents(hash) {
            setContents(await decompress(hash));
        }
        if (hash && props.inUrl) {
            decodeContents(hash);
        }
    }, [hash])

    const check = <div className="container" style={style}>
        <p>{props.message + ' \u2713'}</p>
    </div>

    const fileDrop = StyledDropzone({
        message: props.message,
        setter: setContents
    });

    if (props.file)
        return check;
    return fileDrop;
}

export { Uploader };