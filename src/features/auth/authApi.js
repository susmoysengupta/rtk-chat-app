import { apiSlice } from '../api/apiSlice';
import { userLoggedIn } from './authSlice';

export const authApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		register: builder.mutation({
			query: (newUser) => ({
				url: '/register',
				method: 'POST',
				body: newUser,
			}),
			async onQueryStarted(arg, { queryFulfilled, dispatch }) {
				try {
					const { data } = await queryFulfilled;

					localStorage.setItem(
						'auth',
						JSON.stringify({
							accessToken: data.accessToken,
							user: data.user,
						})
					);

					dispatch(
						userLoggedIn({
							accessToken: data.accessToken,
							user: data.user,
						})
					);
				} catch (err) {
					console.error(err);
				}
			},
		}),
		login: builder.mutation({
			query: (newUser) => ({
				url: '/login',
				method: 'POST',
				body: newUser,
			}),
			async onQueryStarted(arg, { queryFulfilled, dispatch }) {
				try {
					const { data } = await queryFulfilled;

					localStorage.setItem(
						'auth',
						JSON.stringify({
							accessToken: data.accessToken,
							user: data.user,
						})
					);

					dispatch(
						userLoggedIn({
							accessToken: data.accessToken,
							user: data.user,
						})
					);
				} catch (err) {
					console.error(err);
				}
			},
		}),
	}),
});

export const { useRegisterMutation, useLoginMutation } = authApi;
