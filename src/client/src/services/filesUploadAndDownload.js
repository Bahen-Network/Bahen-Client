import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Make an http call to upload files to Greenfield
export const uploadToGreenField = async (files, container) => {  
  let bucketName;
  if (container == "") {
    bucketName = uuidv4();
  }
  else{
    bucketName = container;
  }

  const formData = new FormData();
  formData.append('folder', files[0])
  formData.append('bucketName', bucketName);
  formData.append('objectName', 'train.py');
  const response = await fetch('http://bahenfileservice.azurewebsites.net/api/v1/objects', {
      method: 'POST',
      body: formData
  });

  return bucketName;
};

// Make an http call to download files from Greenfield
export const downloadFromGreenField = async ( bucketName, progress, setProgress ) => {
  const params = {
    bucketName: bucketName
  };
  const queryString = new URLSearchParams(params).toString();
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `http://bahenfileservice.azurewebsites.net/api/v1/buckets/objects?${queryString}`, true);
  xhr.responseType = 'blob';
  xhr.onprogress = (event) => {
    if (event.lengthComputable) {
      const percentComplete = (event.loaded / event.total) * 100;
      const tempProgress = {...progress};
      tempProgress[bucketName] = parseFloat(percentComplete.toFixed(2));
      setProgress(tempProgress);
    }
  };
  xhr.onload = () => {
    console.log(xhr)
    if (xhr.status !== 200) {
      throw new Error("Network response was not ok");
    }
    const blob = xhr.response;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'training_result.zip';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  xhr.send();
};