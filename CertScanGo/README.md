```markdown
# CertScanGo

CertScanGo is a Python command-line application designed to connect to OpenShift clusters, scan ConfigMaps and Secrets for SSL/TLS certificates, analyze their expiration dates, and provide detailed results through colorized terminal output and JSON export functionality. Additionally, it offers a frontend interface for managing and viewing scan results, using a modern stack built with ReactJS, Express, and MongoDB.

## Overview

CertScanGo's architecture includes a command-line interface for direct interactions with OpenShift clusters and a web-based frontend for a richer user experience. Key technologies and tools used are:

- **Frontend:** ReactJS, Vite, Tailwind CSS, Shadcn UI components
- **Backend:** Node.js with Express, MongoDB with Mongoose for database management
- **Supporting Libraries:** Kubernetes Python Client, cryptography for certificate processing, colorama, rich, and tabulate for terminal enhancements, PyYAML and python-dotenv for configuration management
- **Communication:** REST API connecting frontend and backend
- **Development Tools:** Concurrently for running both frontend and backend simultaneously

### Project Structure

- **client/**: Contains the ReactJS frontend implementation, Vite configuration, and Tailwind CSS setup.
- **server/**: Express server providing REST API endpoints, MongoDB configurations, and other backend services.
- **api/**: Directory within the server containing all the API routes.
- **components/**: Reusable UI components for the frontend.
- **pages/**: Page components for routing in the frontend.
- **utils/**: Utility functions and configurations for both frontend and backend.

## Features

CertScanGo provides the following functionalities:

- **Initial Setup:**
  - Users can provide OpenShift cluster connection details through command-line arguments, environment variables, configuration files, or interactive prompts.
  
- **Running Scans:**
  - Users can execute scans via command line with options to specify cluster details, namespace, output format, and warning thresholds.

- **Terminal Output:**
  - Real-time scanning progress with color-coded results indicating the status of certificates (OK, WARNING, EXPIRED).
  - Detailed information for each certificate including status, object type, object name, certificate key name, expiration date, and days remaining.

- **JSON Output:**
  - Provides structured JSON files containing detailed scan results.

- **Web Interface:**
  - Dashboard displaying certificate statistics, recent scans, and cluster status.
  - Cluster management with CRUD operations, status display, and connection testing.
  - Filtering, searching, and exporting scan results.

- **Error Handling:**
  - Clear error messages for authentication failures, network issues, invalid certificate data, and permission problems.

- **Configuration:**
  - Flexible configuration options for cluster connection details and scanning behavior via YAML files and environment variables.

## Getting Started

### Requirements
- **Node.js** (version 14 or above)
- **Python** (version 3.6 or above)
- **MongoDB**
- **npm** or **yarn**

### Quickstart

1. **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/certscango.git
    cd certscango
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Set up the MongoDB database:**
    Ensure MongoDB is running and accessible. Configure the `server/.env` file with the MongoDB URL.

4. **Start the application:**
    ```bash
    npm run start
    ```
    This command will concurrently start the frontend (on port 5173) and the backend (on port 3000).

5. **Run the command-line scanner** (example usage):
    ```bash
    python cert-monitor.py --cluster https://openshift.example.com --token <auth-token>
    ```

### License
```
The project is proprietary. All rights reserved.
© 2024 CertScanGo.
```
```
