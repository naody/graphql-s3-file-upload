import { gql, useMutation } from "@apollo/client";
import React, { useRef, useState } from "react";

// Gets AWS Signed URL.
const GET_SIGNED_URL = gql`
  mutation getSignedURL($name: String!, $type: String!) {
    getSignedURL(name: $name, type: $type) {
      signedUrl
      fileUrl
    }
  }
`;

// Saves file info and url to db.
const ADD_FILE = gql`
  mutation addFile($file: FileInput!) {
    addFile(file: $file) {
      id
      name
      type
      size
      url
    }
  }
`;

function App() {
  const [file, setFile] = useState();

  const [getSignedURL, { loading, data }] = useMutation(GET_SIGNED_URL);
  const [addFile, { data: uploadedFile }] = useMutation(ADD_FILE);
  const fileRef = useRef();

  const uploadToS3 = async () => {
    const signedUrl = data?.getSignedURL?.signedUrl;

    if (!signedUrl.length) return;

    const options = {
      method: "PUT",
      body: file,
      headers: {
        Accept: "application/json",
        "Content-Type": file.type,
      },
    };

    try {
      const response = await fetch(signedUrl, options);

      if (response.status === 200) {
        // Successful upload. Send file information to the backend.
        const { name, type, size, lastModified } = fileRef.current.files[0];
        const url = data?.getSignedURL?.fileUrl;
        addFile({
          variables: { file: { name, type, url, size, lastModified } },
        });
      } else {
        console.log(response.statusText);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    uploadToS3();
  };

  return (
    <div>
      <h2>S3 Uploader 🚀</h2>

      <form onSubmit={handleSubmit}>
        <div className="usa-file-input">
          <div className="usa-file-input__target">
            <div className="usa-file-input__instructions" aria-hidden="true">
              <span className="usa-file-input__drag-text">
                Drag file here or{" "}
              </span>
              <span className="usa-file-input__choose">choose from folder</span>
            </div>
            <div className="usa-file-input__box"></div>

            <input
              ref={fileRef}
              id="file-input-single"
              className="usa-file-input__input"
              type="file"
              name="file-input-single"
              aria-describedby="file-input-specific-hint"
              onChange={(event) => {
                if (fileRef?.current?.files?.length) {
                  // Workaround to enable the upload button.
                  delete uploadedFile?.addFile?.id;

                  setFile(fileRef.current.files[0]);
                  const { name, type } = fileRef.current.files[0];
                  // Generate signed URL.
                  getSignedURL({
                    variables: { name, type },
                  });
                }
              }}
              accept=".jpeg,.png"
            />
          </div>

          {fileRef.current?.files[0]?.name && (
            <sub>
              <b>File: </b>
              {fileRef.current?.files[0]?.name}
            </sub>
          )}

          <br />
          <br />
          {data?.getSignedURL && (
            <>
              <h3>Signed URL:</h3>
              <code>
                <pre>{JSON.stringify(data?.getSignedURL, null, 2)}</pre>
              </code>
            </>
          )}
          <br />
          <br />
          {uploadedFile?.addFile.id && (
            <>
              <h3>Uploaded File DB record:</h3>
              <code>
                <pre>{JSON.stringify(uploadedFile.addFile, null, 2)}</pre>
              </code>
            </>
          )}
          <br />
          <br />
          <button
            disabled={loading || !file || uploadedFile?.addFile?.id}
            className="usa-button "
            type="submit"
          >
            Upload File
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
