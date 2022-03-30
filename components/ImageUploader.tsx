import React, { ChangeEvent, useState } from 'react';
import { auth, storage, STATE_CHANGED } from '@libs/firebase';
import Loader from '@components/Loader';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export default function ImageUploader() 
{
  const [ uploading, setUploading ] = useState( false );
  const [ progress, setProgress ] = useState( 0 );
  const [ downloadURL, setDownloadURL ] = useState<string | null>( null );

  const uploadFile = async ( e ) => {
    // Get the file
    // const file = files[0];
    // const imageFile = file = e.target.files[0];
    const file = Array.from( e.target.files )[0];
    const extension = file.type.split("/")[1];

    console.log( file );

    // Makes a reference to the storage bucket location
    const fileRef = ref( storage, `uploads/${ auth.currentUser?.uid }/${ Date.now() }.${ extension }` );
    setUploading( true );

    // Starts the upload
    const uploadTask = uploadBytesResumable( fileRef, file );
    uploadTask.on( STATE_CHANGED, 
      ( snapshot ) => {
        const progress = (( snapshot.bytesTransferred / snapshot.totalBytes ) * 100).toFixed(0);
        setProgress( Number( progress ) );
    },
    
    ( error ) => {
      // handle errors
    },
    () => {
      // Handle successful uploads on complete
      getDownloadURL( uploadTask.snapshot.ref )
        .then( downloadURL => {
          setDownloadURL( downloadURL );
          setUploading( false );
        })
    }
  )};

  return (
    <div className="box">
      <Loader show={ uploading }/>
      { uploading && <h3>{ progress }%</h3> }

      { !uploading && (
        <>
          <label className="btn">
            📷 Upload Image
            <input type="file" onChange={ uploadFile } accept="image/x-png,image/gif,image/jpeg,image/jpg"/>
          </label>
        </>
      )}

      { downloadURL && <code className="upload-snippet">{`![alt](${ downloadURL })`}</code> }
    </div>
  )
}
