import io from 'socket.io-client';
import { apiSlice } from '../api/apiSlice';
import { messagesApi } from '../messages/messagesApi';

export const conversationsApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getConversations: builder.query({
			query: (email) =>
				`/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,
			transformResponse(apiResponse, meta) {
				const totalConversationCount =
					meta.response.headers.get('X-Total-Count');
				return {
					data: apiResponse,
					totalCount: +totalConversationCount,
				};
			},
			async onCacheEntryAdded(
				arg,
				{
					dispatch,
					cacheDataLoaded,
					updateCachedData,
					cacheEntryRemoved,
				}
			) {
				const socket = io('http://localhost:9000', {
					reconnectionDelay: 1000,
					reconnection: true,
					reconnectionAttempts: 10,
					transports: ['websocket'],
					agent: false,
					upgrade: false,
					rejectUnauthorized: false,
				});

				try {
					await cacheDataLoaded;
					socket.on('conversation', (conversation) => {
						updateCachedData((draft) => {
							const draftConversation = draft.data.find(
								(c) => c.id == conversation?.data?.id
							);

							if (draftConversation?.id) {
								draftConversation.message =
									conversation?.data?.message;
								draftConversation.timestamp =
									conversation?.data?.timestamp;
							} else {
								draft.data.push(conversation?.data);
							}
						});
					});
				} catch (err) {}

				await cacheEntryRemoved;
				socket.close();
			},
		}),
		getMoreConversations: builder.query({
			query: ({ email, page }) =>
				`/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=${page}&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,
			async onQueryStarted(
				{ email, page },
				{ dispatch, queryFulfilled }
			) {
				try {
					const conversations = await queryFulfilled;
					if (conversations?.data?.length) {
						dispatch(
							apiSlice.util.updateQueryData(
								'getConversations',
								email,
								(draft) => {
									return {
										data: [
											...draft.data,
											...conversations.data,
										],
										totalCount: +draft.totalCount,
									};
								}
							)
						);
					}
				} catch (err) {
					console.log(err);
				}
			},
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
				try {
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
				} catch (err) {}
			},
		}),
		editConversation: builder.mutation({
			query: ({ id, body }) => ({
				url: `/conversations/${id}`,
				method: 'PATCH',
				body,
			}),

			async onQueryStarted(arg, { dispatch, queryFulfilled }) {
				// optimistic cache update
				const conversationPatchResult = dispatch(
					apiSlice.util.updateQueryData(
						'getConversations',
						arg.sender,
						(draft) => {
							const draftConversation = draft.data.find(
								(conversation) => conversation.id == arg.id
							);
							draftConversation.message = arg.body.message;
							draftConversation.timestamp = arg.body.timestamp;
						}
					)
				);

				try {
					const conversation = await queryFulfilled;
					if (conversation?.data?.id) {
						const users = arg.body.users;
						const senderUser = users.find(
							(user) => user.email === arg.sender
						);
						const receiverUser = users.find(
							(user) => user.email !== arg.sender
						);

						const response = await dispatch(
							messagesApi.endpoints.addMessage.initiate({
								conversationId: conversation.data.id,
								sender: senderUser,
								receiver: receiverUser,
								message: arg.body.message,
								timestamp: arg.body.timestamp,
							})
						).unwrap();

						// pessimistic cache update
						dispatch(
							apiSlice.util.updateQueryData(
								'getMessages',
								response.conversationId.toString(),
								(draft) => {
									draft.push(response);
								}
							)
						);
					}
				} catch (err) {
					conversationPatchResult.undo();
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
