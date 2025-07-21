import api from './api';

// Description: Get certificate statistics for dashboard
// Endpoint: GET /api/certificates/stats
// Request: {}
// Response: { valid: number, warning: number, expired: number, clusters: number }
export const getCertificateStats = async () => {
  try {
    const response = await api.get('/api/certificates/stats');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Get recent scan results
// Endpoint: GET /api/scans/recent
// Request: {}
// Response: { scans: Array<{ _id: string, clusterName: string, timestamp: string, certificatesFound: number, status: string, summary: object }> }
export const getRecentScans = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        scans: [
          {
            _id: '1',
            clusterName: 'Production Cluster',
            timestamp: '2024-03-07T10:30:45Z',
            certificatesFound: 45,
            status: 'completed',
            summary: { valid: 40, warning: 4, expired: 1 }
          },
          {
            _id: '2',
            clusterName: 'Staging Cluster',
            timestamp: '2024-03-07T09:15:22Z',
            certificatesFound: 23,
            status: 'completed',
            summary: { valid: 20, warning: 2, expired: 1 }
          },
          {
            _id: '3',
            clusterName: 'Development Cluster',
            timestamp: '2024-03-07T08:45:10Z',
            certificatesFound: 12,
            status: 'running',
            summary: { valid: 0, warning: 0, expired: 0 }
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/scans/recent');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
}

// Description: Get cluster status information
// Endpoint: GET /api/clusters/status
// Request: {}
// Response: { clusters: Array<{ _id: string, name: string, url: string, status: string, lastScan: string, certificateCount: number, health: object }> }
export const getClusterStatus = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        clusters: [
          {
            _id: '1',
            name: 'Production Cluster',
            url: 'https://api.prod.example.com:6443',
            status: 'connected',
            lastScan: '2024-03-07T10:30:45Z',
            certificateCount: 45,
            health: { valid: 40, warning: 4, expired: 1 }
          },
          {
            _id: '2',
            name: 'Staging Cluster',
            url: 'https://api.staging.example.com:6443',
            status: 'connected',
            lastScan: '2024-03-07T09:15:22Z',
            certificateCount: 23,
            health: { valid: 20, warning: 2, expired: 1 }
          },
          {
            _id: '3',
            name: 'Development Cluster',
            url: 'https://api.dev.example.com:6443',
            status: 'error',
            lastScan: '2024-03-06T15:20:10Z',
            certificateCount: 0,
            health: { valid: 0, warning: 0, expired: 0 }
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/clusters/status');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
}

// Description: Get detailed scan results with filtering
// Endpoint: GET /api/certificates/results
// Request: { status?: string, cluster?: string, search?: string }
// Response: { certificates: Array<{ _id: string, objectName: string, namespace: string, clusterName: string, objectType: string, certificateKey: string, status: string, notValidAfter: string }> }
export const getScanResults = async (filters = {}) => {
  try {
    const response = await api.get('/api/certificates/results', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Export scan results to JSON
// Endpoint: POST /api/certificates/export
// Request: { format: string, filters?: object, certificateIds?: Array<string> }
// Response: JSON file download
export const exportResults = async (data) => {
  try {
    console.log('Making export request with data:', data);
    const response = await api.post('/api/certificates/export', data, {
      responseType: 'blob'
    });

    console.log('Export response received:', {
      status: response.status,
      headers: response.headers,
      dataType: typeof response.data,
      isBlob: response.data instanceof Blob,
      blobSize: response.data instanceof Blob ? response.data.size : 'N/A',
      blobType: response.data instanceof Blob ? response.data.type : 'N/A'
    });

    // Check if response is actually a blob (successful export)
    if (response.data instanceof Blob) {
      // Create download link
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'certificates-export.json';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Export completed successfully' };
    } else {
      // If response is not a blob, it might be an error response
      console.log('Response is not a blob, treating as error');
      throw new Error('Invalid response format received');
    }
  } catch (error) {
    console.log('Export error caught:', {
      hasResponse: !!error.response,
      status: error.response?.status,
      dataType: typeof error.response?.data,
      isBlob: error.response?.data instanceof Blob,
      blobSize: error.response?.data instanceof Blob ? error.response.data.size : 'N/A',
      blobType: error.response?.data instanceof Blob ? error.response.data.type : 'N/A',
      message: error.message
    });

    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      if (error.response.data instanceof Blob) {
        console.log('Error response is a blob, reading as text...');
        // Error response is a blob, need to read it as text
        try {
          const text = await error.response.data.text();
          console.log('Blob text content:', text);
          try {
            const errorData = JSON.parse(text);
            console.log('Parsed error data:', errorData);
            throw new Error(errorData.error || 'Export failed');
          } catch (parseError) {
            console.log('Failed to parse error JSON:', parseError.message);
            throw new Error('Export failed with unknown error');
          }
        } catch (blobError) {
          console.log('Failed to read blob as text:', blobError.message);
          throw new Error('Export failed - could not read error response');
        }
      } else if (error.response.data && error.response.data.error) {
        console.log('Error response is JSON:', error.response.data);
        // Error response is JSON
        throw new Error(error.response.data.error);
      } else {
        console.log('Error response format unknown:', error.response.data);
        throw new Error(`Export failed: ${error.response.status}`);
      }
    } else {
      console.log('No response in error:', error.message);
      throw new Error(error.message || 'Export failed');
    }
  }
}

// Description: Export single certificate to JSON
// Endpoint: GET /api/certificates/:id/export
// Request: { certificateId: string }
// Response: JSON file download
export const exportSingleCertificate = async (certificateId) => {
  try {
    const response = await api.get(`/api/certificates/${certificateId}/export`, {
      responseType: 'blob'
    });

    // Check if response is actually a blob (successful export)
    if (response.data instanceof Blob) {
      // Create download link
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `certificate-${certificateId}.json`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Certificate exported successfully' };
    } else {
      // If response is not a blob, it might be an error response
      throw new Error('Invalid response format received');
    }
  } catch (error) {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      if (error.response.data instanceof Blob) {
        // Error response is a blob, need to read it as text
        const text = await error.response.data.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Export failed');
        } catch (parseError) {
          throw new Error('Export failed with unknown error');
        }
      } else if (error.response.data && error.response.data.error) {
        // Error response is JSON
        throw new Error(error.response.data.error);
      } else {
        throw new Error(`Export failed: ${error.response.status}`);
      }
    } else {
      throw new Error(error.message || 'Export failed');
    }
  }
}