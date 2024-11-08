import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setError(null);
        setData(null);
        setUploadProgress(0);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);

        try {
            const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                },
            });
            setData(response.data);
        } catch (err) {
            setError('Failed to upload document');
            console.error(err);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">
                <i className="fas fa-upload"></i> Document Upload
            </h1>
            <form onSubmit={handleSubmit} className="bg-light p-4 rounded shadow-sm">
                <div className="form-group">
                    <label htmlFor="fileUpload" className="font-weight-bold">Choose Document:</label>
                    <input
                        type="file"
                        id="fileUpload"
                        name="document"
                        onChange={handleFileChange}
                        required
                        className="form-control-file"
                    />
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                    <i className="fas fa-cloud-upload-alt"></i> Upload
                </button>
            </form>

            {uploadProgress > 0 && (
                <div className="progress mt-3">
                    <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${uploadProgress}%` }}
                        aria-valuenow={uploadProgress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    >
                        {uploadProgress}%
                    </div>
                </div>
            )}

            {error && <p className="text-danger text-center mt-3">{error}</p>}
            {data && (
                <div className="mt-4">
                    <h2 className="text-center">Extracted Data</h2>
                    <div className="card">
                        <div className="card-body">
                            {data.name && (
                                <p className="card-text"><strong>Name:</strong> {data.name}</p>
                            )}
                            {data.documentNumber && (
                                <p className="card-text"><strong>Document Number:</strong> {data.documentNumber}</p>
                            )}
                            {data.expirationDate && (
                                <p className="card-text"><strong>Expiration Date:</strong> {data.expirationDate}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
