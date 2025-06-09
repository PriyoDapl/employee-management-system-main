
// Helper function to get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to make authenticated API calls
const apiCall = async (url, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
};

// Project API functions
export const projectsAPI = {
  // Get all projects
  getAll: async () => {
    return await apiCall('/api/projects');
  },

  // Get single project
  getById: async (id) => {
    return await apiCall(`/api/projects/${id}`);
  },

  // Create new project
  create: async (projectData) => {
    return await apiCall('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  // Update project
  update: async (id, projectData) => {
    return await apiCall(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },

  // Delete project
  delete: async (id) => {
    return await apiCall(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

export default apiCall;
