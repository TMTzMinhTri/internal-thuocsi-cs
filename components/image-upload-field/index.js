import React, { useState, useRef } from 'react';
import { Box, createStyles, Grid, IconButton, Typography } from '@material-ui/core';
import { Close, AddAPhoto } from '@material-ui/icons';
import Image from 'next/image';

import ModalCropper from 'components/cropper-v2';

const styles = createStyles({
  imageContainer: {
    position: 'relative',
    marginRight: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  addButton: {
    cursor: 'pointer',
  },
});

export default function ImageUploadField({
  images = [],
  title = 'Cập nhật hình ảnh',
  buttonText = 'Upload',
  handleCropImage,
  handleCropCallback,
  handleRemoveImage,
  required = false,
}) {
  const [addProductImageModalOpen, setAddProductImageModalOpen] = useState(false);

  const imageRef = useRef(null);

  return (
    <Box pt={1}>
      <Grid container spacing={1}>
        <ModalCropper
          open={addProductImageModalOpen}
          onClose={() => setAddProductImageModalOpen(false)}
          title={title}
          text={buttonText}
          handleCrop={(...props) => {
            handleCropImage?.(...props);
            setAddProductImageModalOpen(false);
          }}
          myRef={imageRef}
          callback={(...props) => {
            handleCropCallback(...props);
            setAddProductImageModalOpen(false);
          }}
        />
        {images.map((url, i) => (
          <Grid key={`gr_${i}`} item style={styles.imageContainer}>
            <Image src={url} width={100} height={100} objectFit="contain" />
            <IconButton
              style={styles.removeButton}
              size="small"
              color="secondary"
              onClick={() => {
                handleRemoveImage?.(url);
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Grid>
        ))}
        <Grid item>
          <Box
            style={styles.addButton}
            border={2}
            borderColor="grey.500"
            borderRadius={6}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="flex-end"
            color="grey.500"
            height={100}
            width={100}
            onClick={() => setAddProductImageModalOpen(true)}
          >
            <Box padding={0.5}>
              <AddAPhoto width={30} height={30} />
            </Box>
            <Typography variant="caption" align="center">
              Thêm hình ảnh
            </Typography>
            <Typography variant="caption" align="center">
              {required ? '(Bắt buộc)' : '(Không bắt buộc)'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
