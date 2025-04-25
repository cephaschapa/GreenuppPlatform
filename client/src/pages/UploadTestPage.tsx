import React from 'react';
import { FileUploadTest } from '@/components/FileUploadTest';

export default function UploadTestPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Upload Test Page</h1>
      <p className="mb-6">
        This page allows you to test the file upload functionality for Green Socials.
        You can upload images that will be stored on the server and accessible via URLs.
      </p>
      <FileUploadTest />
    </div>
  );
}