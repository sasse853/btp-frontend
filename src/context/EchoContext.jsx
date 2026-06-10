import { createContext, useContext, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useAuth } from '../hooks/useAuth';
import { ajouter } from '../store/notifSlice';

const EchoContext = createContext(null);

export const useEcho = () => useContext(EchoContext);

export const EchoProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { utilisateur, estAuthentifie, estAdmin } = useAuth();
  const echoRef = useRef(null);

  useEffect(() => {
    const cle = import.meta.env.VITE_PUSHER_APP_KEY;

    // Sans cle Pusher configuree, on saute proprement le temps reel.
    if (!estAuthentifie || !cle) {
      return undefined;
    }

    window.Pusher = Pusher;
    const echo = new Echo({
      broadcaster: 'pusher',
      key: cle,
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
      forceTLS: true,
      authEndpoint: `${(import.meta.env.VITE_API_URL || '').replace('/api/v1', '')}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('btp_token')}`,
          Accept: 'application/json',
        },
      },
    });

    echoRef.current = echo;

    const surNotification = (payload) => {
      dispatch(ajouter(payload));
      toast.info(payload.message || 'Nouvelle notification');
    };

    // Canal personnel.
    const canalUser = echo.private(`user.${utilisateur.id}`);
    ['nouvelle-depense', 'nouveau-document', 'nouvel-avenant', 'avenant-approuve', 'changement-statut', 'alerte-budget']
      .forEach((evt) => canalUser.listen(`.${evt}`, surNotification));

    // Canal admin global.
    if (estAdmin) {
      const canalAdmin = echo.private('admin');
      ['nouvelle-depense', 'nouveau-document', 'nouvel-avenant', 'alerte-budget']
        .forEach((evt) => canalAdmin.listen(`.${evt}`, surNotification));
    }

    return () => {
      echo.disconnect();
      echoRef.current = null;
    };
  }, [estAuthentifie, utilisateur, estAdmin, dispatch]);

  return <EchoContext.Provider value={echoRef}>{children}</EchoContext.Provider>;
};
