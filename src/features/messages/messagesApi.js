import { apiSlice } from '../api/apiSlice';

export const messagesApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getMessages: builder.query({
			query: (conversationID) =>
				`/messages?conversationId=${conversationID}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,
		}),
	}),
});

export const { useGetMessagesQuery } = messagesApi;
