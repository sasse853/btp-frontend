import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { chargerNonLues, marquerToutLu } from '../store/notifSlice';
import { selectEstAuthentifie } from '../store/authSlice';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const estAuthentifie = useSelector(selectEstAuthentifie);
  const { items, nonLues } = useSelector((state) => state.notif);

  useEffect(() => {
    if (estAuthentifie) {
      dispatch(chargerNonLues());
    }
  }, [estAuthentifie, dispatch]);

  return {
    items,
    nonLues,
    rafraichir: () => dispatch(chargerNonLues()),
    toutMarquerLu: () => dispatch(marquerToutLu()),
  };
};
