import { useSelector, useDispatch } from 'react-redux';
import { selectUtilisateur, selectRole, selectEstAuthentifie, deconnexion } from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const utilisateur = useSelector(selectUtilisateur);
  const role = useSelector(selectRole);
  const estAuthentifie = useSelector(selectEstAuthentifie);

  return {
    utilisateur,
    role,
    estAuthentifie,
    estAdmin: role === 'admin',
    estChef: role === 'chef_chantier',
    seDeconnecter: () => dispatch(deconnexion()),
  };
};
