import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Box, Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';

interface FileDropzoneProps {
  label: string;
  accept?: Accept;
  multiple?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
}

export function FileDropzone({ label, accept, multiple = false, files, onChange, error }: FileDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      onChange(multiple ? [...files, ...accepted] : accepted.slice(0, 1));
    },
    [files, multiple, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, multiple });

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: error ? 'error.main' : isDragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 2,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'transparent',
        }}
      >
        <input {...getInputProps()} />
        <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
          <UploadFileIcon color={error ? 'error' : 'action'} />
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {files.length > 0 && (
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {files.map((f) => f.name).join(', ')}
            </Typography>
          )}
        </Stack>
      </Box>
      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}
    </Box>
  );
}
