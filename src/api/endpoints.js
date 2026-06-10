import api from './axios';

// Construit un objet FormData pour les requetes avec fichier.
// Laravel n'interprete PATCH/PUT multipart : on passe par POST + _method.
const toFormData = (data, method) => {
  const fd = new FormData();
  if (method) fd.append('_method', method);
  Object.entries(data).forEach(([cle, valeur]) => {
    if (valeur === null || valeur === undefined) return;
    fd.append(cle, valeur);
  });
  return fd;
};

const aDesFichiers = (data) =>
  Object.values(data).some((v) => v instanceof File);

// --- Authentification ---
export const authApi = {
  login: (payload) => api.post('/login', payload),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

// Fabrique un module CRUD standard pour une ressource.
const ressource = (chemin) => ({
  liste: (params = {}) => api.get(`/${chemin}`, { params }),
  detail: (id) => api.get(`/${chemin}/${id}`),
  creer: (data) =>
    aDesFichiers(data)
      ? api.post(`/${chemin}`, toFormData(data), { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post(`/${chemin}`, data),
  modifier: (id, data) =>
    aDesFichiers(data)
      ? api.post(`/${chemin}/${id}`, toFormData(data, 'PUT'), { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/${chemin}/${id}`, data),
  supprimer: (id) => api.delete(`/${chemin}/${id}`),
});

export const chantiersApi = {
  ...ressource('chantiers'),
  chefs: () => api.get('/chefs'),
};
export const personnelApi = ressource('personnel');
export const presencesApi = {
  ...ressource('presences'),
  batch: (payload) => api.post('/presences/batch', payload),
};
export const materiauxApi = ressource('materiaux');
export const equipementsApi = ressource('equipements');

export const financesApi = {
  ...ressource('finances'),
  valider: (id, payload) => api.patch(`/finances/${id}/valider`, payload),
};
export const avenantsApi = {
  ...ressource('avenants'),
  valider: (id, payload) => api.patch(`/avenants/${id}/valider`, payload),
};
export const documentsApi = {
  ...ressource('documents'),
  valider: (id, payload) => api.patch(`/documents/${id}/valider`, payload),
  telecharger: (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
};

export const messagesApi = {
  liste: (idChantier, params = {}) => api.get(`/chantiers/${idChantier}/messages`, { params }),
  envoyer: (idChantier, data) =>
    aDesFichiers(data)
      ? api.post(`/chantiers/${idChantier}/messages`, toFormData(data), { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post(`/chantiers/${idChantier}/messages`, data),
};

export const notificationsApi = {
  liste: (params = {}) => api.get('/notifications', { params }),
  nonLues: () => api.get('/notifications/non-lues'),
  marquerLue: (id) => api.patch(`/notifications/${id}/lue`),
  toutMarquerLu: () => api.patch('/notifications/tout-lu'),
};

export const rapportsApi = {
  generer: (idChantier, payload) =>
    api.post(`/chantiers/${idChantier}/rapport`, payload, { responseType: 'blob' }),
};
