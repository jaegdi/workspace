import api from './api';

// Description: Get all configured clusters
// Endpoint: GET /api/clusters
// Request: {}
// Response: { clusters: Array<{ _id: string, name: string, url: string, status: string, namespaces: Array<string>, autoScan: boolean, scanInterval: number, lastScan: string, certificateCount: number }> }
export const getClusters = () => {
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
            namespaces: ['default', 'web', 'api'],
            autoScan: true,
            scanInterval: 24,
            lastScan: '2024-03-07T10:30:45Z',
            certificateCount: 45
          },
          {
            _id: '2',
            name: 'Staging Cluster',
            url: 'https://api.staging.example.com:6443',
            status: 'connected',
            namespaces: [],
            autoScan: true,
            scanInterval: 12,
            lastScan: '2024-03-07T09:15:22Z',
            certificateCount: 23
          },
          {
            _id: '3',
            name: 'Development Cluster',
            url: 'https://api.dev.example.com:6443',
            status: 'error',
            namespaces: ['dev', 'test'],
            autoScan: false,
            scanInterval: 24,
            lastScan: '2024-03-06T15:20:10Z',
            certificateCount: 0
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/clusters');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
}

// Description: Add a new cluster configuration
// Endpoint: POST /api/clusters
// Request: { name: string, url: string, token: string, namespaces: Array<string>, autoScan: boolean, scanInterval: number }
// Response: { success: boolean, cluster: object, message: string }
export const addCluster = (data) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        cluster: {
          _id: Date.now().toString(),
          ...data,
          status: 'unknown',
          lastScan: null,
          certificateCount: 0
        },
        message: 'Cluster added successfully'
      });
    }, 1000);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/clusters', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
}

// Description: Update an existing cluster configuration
// Endpoint: PUT /api/clusters/:id
// Request: { name: string, url: string, token: string, namespaces: Array<string>, autoScan: boolean, scanInterval: number }
// Response: { success: boolean, cluster: object, message: string }
export const updateCluster = (clusterId, data) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        cluster: {
          _id: clusterId,
          ...data
        },
        message: 'Cluster updated successfully'
      });
    }, 1000);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put(`/api/clusters/${clusterId}`, data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
}

// Description: Delete a cluster configuration
// Endpoint: DELETE /api/clusters/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteCluster = (clusterId) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Cluster deleted successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.delete(`/api/clusters/${clusterId}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
}

// Description: Test connection to a cluster
// Endpoint: POST /api/clusters/:id/test
// Request: {}
// Response: { success: boolean, message: string, details?: object }
export const testConnection = (clusterId) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      resolve({
        success,
        message: success 
          ? 'Connection successful - cluster is reachable and authentication is valid'
          : 'Connection failed - please check your cluster URL and authentication token',
        details: success ? {
          version: 'v1.24.0',
          nodes: 3,
          namespaces: 12
        } : null
      });
    }, 2000);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post(`/api/clusters/${clusterId}/test`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
}