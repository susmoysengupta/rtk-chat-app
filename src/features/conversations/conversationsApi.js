import { apiSlice } from '../api/apiSlice';
import { messagesApi } from '../messages/messagesApi';

export const conversationsApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getConversations: builder.query({
			query: (email) =>
				`/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,
		}),
		getConversation: builder.query({
			query: ({ userEmail, partnerEmail }) =>
				`/conversations?participants_like=${userEmail}-${partnerEmail}&&participants_like=${partnerEmail}-${userEmail}`,
		}),
		addConversation: builder.mutation({
			query: ({ body }) => ({
				url: '/conversations',
				method: 'POST',
				body,
			}),
			async onQueryStarted(arg, { dispatch, queryFulfilled }) {
				const conversation = await queryFulfilled;
				if (conversation?.data?.id) {
					const users = arg.body.users;
					const senderUser = users.find(
						(user) => user.email === arg.sender
					);
					const receiverUser = users.find(
						(user) => user.email !== arg.sender
					);
					dispatch(
						messagesApi.endpoints.addMessage.initiate({
							conversationId: conversation.data.id,
							sender: senderUser,
							receiver: receiverUser,
							message: arg.body.message,
							timestamp: arg.body.timestamp,
						})
					);
				}
			},
		}),
		editConversation: builder.mutation({
			query: ({ id, body }) => ({
				url: `/conversations/${id}`,
				method: 'PATCH',
				body,
			}),

			async onQueryStarted(arg, { dispatch, queryFulfilled }) {
				const conversation = await queryFulfilled;
				if (conversation?.data?.id) {
					const users = arg.body.users;
					const senderUser = users.find(
						(user) => user.email === arg.sender
					);
					const receiverUser = users.find(
						(user) => user.email !== arg.sender
					);
					dispatch(
						messagesApi.endpoints.addMessage.initiate({
							conversationId: conversation.data.id,
							sender: senderUser,
							receiver: receiverUser,
							message: arg.body.message,
							timestamp: arg.body.timestamp,
						})
					);
				}
			},
		}),
	}),
});

export const {
	useGetConversationsQuery,
	useGetConversationQuery,
	useAddConversationMutation,
	useEditConversationMutation,
} = conversationsApi;
