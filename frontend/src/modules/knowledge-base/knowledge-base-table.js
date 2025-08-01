import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
    Typography,
    Box,
    Button,
    Snackbar,
    Alert,
    Card,
    CardContent,
    Chip,
    Tooltip,
    LinearProgress,
    Fade,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Refresh as RefreshIcon, PictureAsPdf as PdfIcon, Description as DocIcon, Code as HtmlIcon, InsertDriveFile as FileIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import KnowledgeBaseForm from './knowledge-base-form';
import { uploadFiles, getFiles, deleteFile } from '../../services/knowledge-base-api-service';


// Table which shows the uploaded files
const KnowledgeBaseTable = () => {

    const [openDialog, setOpenDialog] = useState(false);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [uploadInfo, setUploadInfo] = useState({ count: 0, fileNames: '' });
    const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, file: null });

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
                return <FileIcon color="action" fontSize="small" />;
        }
    };
    const columns = [
        { id: 'id', label: 'ID' },
        { id: 'title', label: 'Title' },
        { id: 'actions', label: 'Actions' }
    ];

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            setIsFetching(true);
            const response = await getFiles();
            setFiles(response.files || []);
        } catch (error) {
            showAlert('Failed to fetch files', 'error');
        } finally {
            setIsFetching(false);
        }
    };

    const handleUpload = async ({ files: uploadedFiles }) => {
        try {
            setLoading(true);

            // Format file names for display
            const fileNames = uploadedFiles.map(file => file.name);
            const displayText = uploadedFiles.length === 1
                ? fileNames[0]
                : `${fileNames.slice(0, 2).join(', ')}${fileNames.length > 2 ? `, +${fileNames.length - 2} more` : ''}`;

            setUploadInfo({ count: uploadedFiles.length, fileNames: displayText });
            await uploadFiles(uploadedFiles);

            const successMessage = uploadedFiles.length === 1
                ? `File "${fileNames[0]}" uploaded successfully`
                : `${uploadedFiles.length} files uploaded successfully`;

            showAlert(successMessage, 'success');
            fetchFiles();
        } catch (error) {
            setUploadInfo({ count: 0, fileNames: '' });
            showAlert('Failed to upload files', 'error');
        } finally {
            setUploadInfo({ count: 0, fileNames: '' });
            setLoading(false);
        }
    };

    const confirmDelete = (file) => {
        setDeleteConfirmation({ open: true, file });
    };

    const handleDeleteConfirm = async () => {
        const file = deleteConfirmation.file;
        if (!file) return;

        try {
            setLoading(true);
            setUploadInfo({ count: 1, fileNames: file.title });
            await deleteFile(file.title);
            showAlert(`File "${file.title}" deleted successfully`, 'success');
            fetchFiles();
        } catch (error) {
            showAlert('Failed to delete file', 'error');
        } finally {
            setLoading(false);
            setUploadInfo({ count: 0, fileNames: '' });
            setDeleteConfirmation({ open: false, file: null });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmation({ open: false, file: null });
    };

    const showAlert = (message, severity) => {
        setAlert({ open: true, message, severity });
    };

    const handleCloseAlert = () => {
        setAlert({ ...alert, open: false });
    };

    return (
        <Box sx={{ p: 1 }} className="fade-in">
            <Card elevation={0} sx={{ mb: 4, borderRadius: 3, bgcolor: 'rgba(58, 134, 255, 0.05)' }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h5" fontWeight="600" color="primary" gutterBottom>
                                Knowledge Base
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Upload and manage your documents (PDF, DOC, HTML) for AI-powered Q&A
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Tooltip title="Refresh files">
                                <span>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={fetchFiles}
                                        disabled={loading}
                                        startIcon={<RefreshIcon />}
                                    >
                                        Refresh
                                    </Button>
                                </span>
                            </Tooltip>
                            <Button
                                variant="contained"
                                color="primary"
                                disableElevation
                                startIcon={<AddIcon />}
                                onClick={() => setOpenDialog(true)}
                                disabled={loading}
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    boxShadow: '0 4px 10px rgba(58, 134, 255, 0.3)'
                                }}
                            >
                                Add File
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {loading && (
                <Fade in={loading}>
                    <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid rgba(25, 118, 210, 0.2)', bgcolor: 'rgba(25, 118, 210, 0.05)' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2" color="primary" fontWeight="600">
                                    {deleteConfirmation.open ? "Deleting File" : `Processing ${uploadInfo.count} ${uploadInfo.count === 1 ? 'File' : 'Files'}`}
                                </Typography>
                                <Chip
                                    label={deleteConfirmation.open ? "Deleting" : "Uploading"}
                                    color="primary"
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>
                            <LinearProgress sx={{ borderRadius: 1, height: 6 }} />
                            {uploadInfo.fileNames && (
                                <Box sx={{ mt: 0.5 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>{deleteConfirmation.open ? "File:" : "Files:"}</strong> {uploadInfo.fileNames}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Fade>
            )}

            <Fade in={true} timeout={500}>
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid rgba(0, 0, 0, 0.08)'
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        sx={{
                                            fontWeight: 600,
                                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                            py: 2
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isFetching ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 3 }}>
                                            <CircularProgress size={24} />
                                            <Typography variant="body1" color="text.secondary">
                                                Loading files...
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : files?.length ? (
                                files.map((file) => (
                                    <TableRow
                                        key={file.id}
                                        hover
                                    >
                                        <TableCell>{file.id}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getFileIcon(file.title)}
                                                <Typography>{file.title}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Delete file">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => confirmDelete(file)}
                                                    size="small"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 3 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No files found in your knowledge base
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                onClick={() => setOpenDialog(true)}
                                                startIcon={<AddIcon />}
                                                sx={{ mt: 1 }}
                                                disabled={loading}
                                            >
                                                Upload your first file
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Fade>

            {openDialog && (
                <KnowledgeBaseForm
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    onUpload={handleUpload}
                />
            )}

            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseAlert}
                    severity={alert.severity}
                    variant="filled"
                    sx={{ width: '100%', borderRadius: 2 }}
                >
                    {alert.message}
                </Alert>
            </Snackbar>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmation.open}
                onClose={handleDeleteCancel}
                slotProps={{
                    elevation: 0,
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to delete "{deleteConfirmation.file?.title}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={handleDeleteCancel}
                        color="inherit"
                        sx={{ borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disableElevation
                        sx={{ borderRadius: 2 }}
                    >
                        {loading ? <CircularProgress color='inherit' size={"20px"} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default KnowledgeBaseTable;
