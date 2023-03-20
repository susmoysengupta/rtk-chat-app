import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { userLoggedIn } from '../features/auth/authSlice';

export default function useAuthCheck() {
	const dispatch = useDispatch();
	const [authChecked, setAuthChecked] = useState(false);

	useEffect(() => {
		const localAuth = localStorage?.getItem('auth');

		if (localAuth) {
			const { accessToken, user } = JSON.parse(localAuth);
			if (accessToken && user) {
				dispatch(userLoggedIn({ accessToken, user }));
			}
		}

		setAuthChecked(true);
	}, [dispatch, setAuthChecked]);

	return authChecked;
}
