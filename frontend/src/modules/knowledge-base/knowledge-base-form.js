import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Button, Typography, Paper,
    ListItemIcon,
    ListItemText,
    IconButton,
    Divider,
    Chip,
    Fade,
    Slide,
    List,
    ListItem
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Delete as DeleteIcon, PictureAsPdf as PdfIcon, Close as CloseIcon, Description as DocIcon, Code as HtmlIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

// This component provides a file upload interface for a knowledge base system
// Props:
// - open: boolean - Controls dialog visibility
// - onClose: function - Handler for closing the dialog
// - onUpload: function - Handler for processing selected files

const KnowledgeBaseForm = ({ open, onClose, onUpload }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);

    const getFileIcon = (fileName) => {
        const extension = fileName.toLowerCase().split('.').pop();

        switch (extension) {
            case 'pdf':
                return <PdfIcon color="error" fontSize="small" />;
            case 'doc':
            case 'docx':
                return <DocIcon color="primary" fontSize="small" />;
            case 'html':
            case 'htm':
            case 'txt':
                return <HtmlIcon color="success" fontSize="small" />;
            default:
                return <PdfIcon color="action" fontSize="small" />;
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/html': ['.html', '.htm'],
            'text/plain': ['.txt']
        },
        multiple: true,
        onDrop: (acceptedFiles) => {
            setSelectedFiles(prevFile => [...prevFile, ...acceptedFiles])
        },
        onDropRejected: (rejectedFiles) => {
            const unsupportedFiles = rejectedFiles.map(rej => rej.file.name).join(', ');
            alert(`Unsupported file(s): ${unsupportedFiles}`);
        }
    });

    const handleUpload = () => {
        onUpload({ files: selectedFiles });
        setSelectedFiles([]);
        onClose();
    };

    const handleDeleteFile = (indexToRemove) => {
        setSelectedFiles((prevFiles) =>
            prevFiles.filter((_, index) => index !== indexToRemove)
        );
    };


    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                elevation: 0,
                sx: { borderRadius: 3 }
            }}
            slots={{ transition: Slide }}
            transitionProps={{ direction: 'up' }}
        >
            <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="600" color="primary">
                    Upload Files to Knowledge Base
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <Divider sx={{ mx: 3 }} />

            <DialogContent sx={{ pt: 3 }}>
                <Fade in={true}>
                    <Paper
                        variant="outlined"
                        {...getRootProps()}
                        sx={{
                            border: '2px dashed',
                            borderColor: isDragActive ? 'primary.main' : 'divider',
                            borderRadius: 3,
                            textAlign: 'center',
                            p: 5,
                            color: isDragActive ? 'primary.main' : 'text.secondary',
                            cursor: 'pointer',
                            bgcolor: isDragActive ? 'rgba(58, 134, 255, 0.05)' : 'transparent',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'rgba(22, 25, 28, 0.05)'
                            }
                        }}
                    >
                        <input {...getInputProps()} />
                        <CloudUploadIcon fontSize="large" color="primary" sx={{ fontSize: 48, mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Drag & Drop Files
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            or click to browse your files
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {['PDF', 'DOC/DOCX', 'HTML/HTM', 'TEXT'].map((label) => (
                                <Chip
                                    key={label}
                                    label={label}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Paper>
                </Fade>

                {selectedFiles?.length > 0 && (
                    <Fade in={true}>
                        <Box mt={3}>
                            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
                                Selected files ({selectedFiles.length})
                            </Typography>
                            <Paper variant="outlined" sx={{ borderRadius: 2, maxHeight: 200, overflow: 'auto' }}>
                                <List dense>
                                    {selectedFiles.map((file, index) => (
                                        <React.Fragment key={index}>
                                            {index > 0 && <Divider component="li" variant="inset" />}
                                            <ListItem
                                                secondaryAction={
                                                    <IconButton
                                                        edge="end"
                                                        color="error"
                                                        onClick={() => handleDeleteFile(index)}
                                                        size="small"
                                                        sx={{ '&:hover': { bgcolor: 'rgba(217, 4, 41, 0.1)' } }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemIcon>
                                                    {getFileIcon(file.name)}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={file.name}
                                                    secondary={`${(file.size / 1024).toFixed(1)} KB`}
                                                />
                                            </ListItem>
                                        </React.Fragment>
                                    ))}
                                </List>
                            </Paper>
                        </Box>
                    </Fade>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    onClick={onClose}
                    color="inherit"
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleUpload}
                    disabled={selectedFiles?.length === 0}
                    variant="contained"
                    disableElevation
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        boxShadow: '0 4px 10px rgba(58, 134, 255, 0.3)'
                    }}
                >
                    Upload
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default KnowledgeBaseForm;
