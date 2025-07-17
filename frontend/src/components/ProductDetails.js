// frontend/src/components/ProductDetails.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ProductDetails = ({ authToken }) => {
    const { id } = useParams(); // Get product ID from URL (e.g., /product/123/details)
    const navigate = useNavigate();
    
    const [product, setProduct] = useState(null);
    const [files, setFiles] = useState([]);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileType, setFileType] = useState('receipt'); // Default file type
    const [fileDescription, setFileDescription] = useState('');
    const [message, setMessage] = useState(''); // Local message state for success/error notifications
    
    useEffect(() => {
        if (!authToken) {
            navigate('/login'); // Redirect if not authenticated
            return;
        }
        
        const fetchDetails = async () => {
            try {
                // 1. Fetch product details from PostgreSQL
                const productRes = await axios.get(`http://localhost:5000/api/products/${id}`, {
                    headers: { 'x-auth-token': authToken }
                });
                setProduct(productRes.data.product);
                
                // 2. Fetch files from MongoDB (associated with this product ID)
                const filesRes = await axios.get(`http://localhost:5000/api/documents/product/${id}/files`, {
                    headers: { 'x-auth-token': authToken }
                });
                setFiles(filesRes.data.files);
                
                // 3. Fetch notes from MongoDB (associated with this product ID)
                const notesRes = await axios.get(`http://localhost:5000/api/documents/product/${id}/notes`, {
                    headers: { 'x-auth-token': authToken }
                });
                setNotes(notesRes.data.notes);
                
                setLoading(false); // All data fetched
            } catch (err) {
                console.error('Error fetching product details:', err.response?.data || err);
                setError(err.response?.data?.message || 'Failed to load product details.');
                setLoading(false);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token'); // Token expired/invalid
                    navigate('/login');
                } else if (err.response?.status === 404) {
                    setError('Product not found.');
                }
            }
        };
        
        fetchDetails();
    }, [id, authToken, navigate]); // Re-fetch if ID or token changes
    
    // Handles adding a new note
    const handleNoteSubmit = async (e) => {
        e.preventDefault();
        if (!newNoteContent.trim()) {
            setMessage('Note content cannot be empty.');
            return;
        }
        try {
            const res = await axios.post(`http://localhost:5000/api/documents/notes/${id}`, // Use product ID in URL
                { content: newNoteContent },
                { headers: { 'x-auth-token': authToken } }
            );
            setNotes([res.data.note, ...notes]); // Add new note to the top of the list
            setNewNoteContent(''); // Clear the textarea
            setMessage('Note added successfully!');
        } catch (err) {
            console.error('Error adding note:', err.response?.data || err);
            setMessage(err.response?.data?.message || 'Failed to add note.');
        }
    };
    
    // Handles deleting a note
    const handleDeleteNote = async (noteId) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await axios.delete(`http://localhost:5000/api/documents/notes/${noteId}`, {
                    headers: { 'x-auth-token': authToken }
                });
                setNotes(notes.filter(note => note._id !== noteId)); // Remove deleted note from state
                setMessage('Note deleted successfully!');
            } catch (err) {
                console.error('Error deleting note:', err.response?.data || err);
                setMessage(err.response?.data?.message || 'Failed to delete note.');
            }
        }
    };
    
    // Handles selecting a file for upload
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]); // Get the first file from the input
    };
    
    // Handles uploading a file
    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setMessage('Please select a file to upload.');
            return;
        }
        
        const formData = new FormData(); // FormData for sending files
        formData.append('productFile', selectedFile); // 'productFile' must match the Multer field name in backend
        formData.append('description', fileDescription); // Add description to form data
        
        try {
            const res = await axios.post(`http://localhost:5000/api/documents/upload/${id}/${fileType}`, formData, {
                headers: {
                    'x-auth-token': authToken,
                    'Content-Type': 'multipart/form-data' // Essential for file uploads
                }
            });
            setFiles([res.data.file, ...files]); // Add new file metadata to state
            setSelectedFile(null); // Clear selected file
            setFileDescription('');
            setFileType('receipt'); // Reset file type
            setMessage('File uploaded successfully!');
        } catch (err) {
            console.error('Error uploading file:', err.response?.data || err);
            setMessage(err.response?.data?.message || 'File upload failed.');
        }
    };
    
    // Handles downloading a file
    const handleFileDownload = async (fileId, originalname) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/documents/file/${fileId}/download`, {
                headers: { 'x-auth-token': authToken },
                responseType: 'blob' // Important: tell Axios to expect binary data (Blob)
            });
            
            // Create a temporary URL for the blob and programmatically trigger download
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', originalname); // Set download filename
            document.body.appendChild(link);
            link.click();
            link.remove(); // Clean up the temporary link
            window.URL.revokeObjectURL(url); // Clean up the blob URL
        } catch (err) {
            console.error('Error downloading file:', err.response?.data || err);
            setMessage(err.response?.data?.message || 'File download failed.');
        }
    };
    
    // Handles deleting a file
    const handleDeleteFile = async (fileId) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            try {
                await axios.delete(`http://localhost:5000/api/documents/file/${fileId}`, {
                    headers: { 'x-auth-token': authToken }
                });
                setFiles(files.filter(file => file._id !== fileId)); // Remove deleted file from state
                setMessage('File deleted successfully!');
            } catch (err) {
                console.error('Error deleting file:', err.response?.data || err);
                setMessage(err.response?.data?.message || 'Failed to delete file.');
            }
        }
    };
    
    if (loading) {
        return <div style={styles.container}><p>Loading product details...</p></div>;
    }
    
    if (error) {
        return <div style={styles.container}><p style={styles.errorText}>Error: {error}</p></div>;
    }
    
    if (!product) {
        return <div style={styles.container}><p>Product not found.</p></div>;
    }
    
    return (
        <div style={styles.container}>
            <button onClick={() => navigate('/products')} style={styles.backButton}>&larr; Back to Products</button>
            <h2>Product Details: {product.name}</h2>
            {message && <p style={styles.infoMessage}>{message}</p>} {/* Display general messages */}
            
            <div style={styles.section}>
                <h3>Basic Information</h3>
                <p><strong>Category:</strong> {product.category}</p>
                <p><strong>Model Number:</strong> {product.model_number || 'N/A'}</p>
                <p><strong>Serial Number:</strong> {product.serial_number || 'N/A'}</p>
                <p><strong>Purchase Date:</strong> {product.purchase_date ? new Date(product.purchase_date).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Purchase Price:</strong> ${product.purchase_price ? parseFloat(product.purchase_price).toFixed(2) : 'N/A'}</p>
                <p><strong>Warranty Expiry:</strong> {product.warranty_expiry_date ? new Date(product.warranty_expiry_date).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Location:</strong> {product.location_in_house || 'N/A'}</p>
                <button onClick={() => navigate(`/products/edit/${product.id}`)} style={styles.editButton}>Edit Product</button>
            </div>
            
            <hr style={styles.divider} />
            
            {/* File Upload Section */}
            <div style={styles.section}>
                <h3>Files & Documents</h3>
                <form onSubmit={handleFileUpload} style={styles.fileUploadForm}>
                    <label style={styles.label}>Select File:</label>
                    <input type="file" onChange={handleFileChange} required style={styles.fileInput} />
                    
                    <label style={styles.label}>File Type:</label>
                    <select value={fileType} onChange={(e) => setFileType(e.target.value)} style={styles.selectInput}>
                        <option value="receipt">Receipt</option>
                        <option value="manual">Manual</option>
                        <option value="other">Other</option>
                    </select>
                    
                    <label style={styles.label}>Description (Optional):</label>
                    <input type="text" value={fileDescription} onChange={(e) => setFileDescription(e.target.value)} placeholder="e.g., Extended warranty document" style={styles.input} />
                    
                    <button type="submit" disabled={!selectedFile} style={styles.uploadButton}>Upload File</button>
                </form>
                
                {files.length === 0 ? (
                    <p>No files uploaded for this product yet.</p>
                ) : (
                    <ul style={styles.list}>
                        {files.map(file => (
                            <li key={file._id} style={styles.listItem}>
                                <span>
                                    {file.originalname} ({file.fileType}) - {(file.size / 1024 / 1024).toFixed(2)} MB
                                    {file.description && ` - ${file.description}`}
                                </span>
                                <div style={styles.fileActions}>
                                    <button onClick={() => handleFileDownload(file._id, file.originalname)} style={styles.downloadButton}>Download</button>
                                    <button onClick={() => handleDeleteFile(file._id)} style={styles.deleteButton}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            <hr style={styles.divider} />
            
            {/* Notes Section */}
            <div style={styles.section}>
                <h3>Notes & Logs</h3>
                <form onSubmit={handleNoteSubmit} style={styles.noteForm}>
                    <textarea
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="Add a new note..."
                        rows="4"
                        style={styles.textarea}
                    ></textarea>
                    <button type="submit" style={styles.addNoteButton}>Add Note</button>
                </form>
                {notes.length === 0 ? (
                    <p>No notes for this product yet.</p>
                ) : (
                    <ul style={styles.list}>
                        {notes.map(note => (
                            <li key={note._id} style={styles.listItem}>
                                <p>{note.content}</p>
                                <small>Created: {new Date(note.createdAt).toLocaleString()}</small>
                                <small> | Last Updated: {new Date(note.updatedAt).toLocaleString()}</small>
                                <div style={styles.noteActions}>
                                    {/* Edit functionality for notes could be added here later */}
                                    <button onClick={() => handleDeleteNote(note._id)} style={styles.deleteButton}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

// Basic inline styles for the component
const styles = {
    container: {
        maxWidth: '800px',
        margin: '50px auto',
        padding: '25px',
        border: '1px solid #e0e0e0',
        borderRadius: '10px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
        backgroundColor: '#ffffff',
        position: 'relative', // For positioning the back button
    },
    backButton: {
        position: 'absolute',
        top: '20px',
        left: '20px',
        padding: '8px 15px',
        backgroundColor: '#6c757d', // Grey
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    section: {
        marginBottom: '30px',
        padding: '15px',
        border: '1px solid #f0f0f0',
        borderRadius: '8px',
        backgroundColor: '#fefefe',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    },
    divider: {
        border: '0',
        height: '1px',
        background: '#e0e0e0',
        margin: '30px 0',
    },
    editButton: {
        padding: '10px 15px',
        backgroundColor: '#ffc107', // Yellow
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '15px',
        marginTop: '15px',
    },
    infoMessage: {
        backgroundColor: '#d4edda', // Light green for success/info messages
        color: '#155724',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '20px',
        textAlign: 'center',
        border: '1px solid #c3e6cb',
    },
    errorText: {
        color: 'red',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    list: {
        listStyleType: 'none',
        padding: '0',
        marginTop: '15px',
    },
    listItem: {
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '5px',
        padding: '10px 15px',
        marginBottom: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap', // Allow content to wrap on smaller screens
    },
    fileActions: {
        display: 'flex',
        gap: '8px',
        marginTop: '5px', // For spacing between text and buttons if on new line
    },
    noteActions: {
        display: 'flex',
        gap: '8px',
        marginTop: '5px',
    },
    downloadButton: {
        padding: '5px 10px',
        backgroundColor: '#007bff', // Blue
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '13px',
    },
    deleteButton: {
        padding: '5px 10px',
        backgroundColor: '#dc3545', // Red
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '13px',
    },
    fileUploadForm: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '15px',
        marginBottom: '20px',
        border: '1px dashed #ced4da', // Dashed border for file upload area
        padding: '15px',
        borderRadius: '8px',
    },
    noteForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '20px',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ced4da',
        minHeight: '80px',
        fontSize: '14px',
        boxSizing: 'border-box',
    },
    input: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ced4da',
        boxSizing: 'border-box',
    },
    selectInput: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ced4da',
        boxSizing: 'border-box',
        fontSize: '14px',
        backgroundColor: '#fff',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        textAlign: 'left',
    },
    uploadButton: {
        padding: '10px 15px',
        backgroundColor: '#28a745', // Green
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '15px',
    },
    addNoteButton: {
        padding: '10px 15px',
        backgroundColor: '#17a2b8', // Teal
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '15px',
    },
};

export default ProductDetails;