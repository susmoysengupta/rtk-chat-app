import gravatarUrl from 'gravatar-url';
import moment from 'moment';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
	conversationsApi,
	useGetConversationsQuery,
} from '../../features/conversations/conversationsApi';
import getPartnerInfo from '../../utils/getPartnerInfo';
import Error from '../ui/Error';
import ChatItem from './ChatItem';

export default function ChatItems() {
	const { user } = useSelector((state) => state.auth);
	const { email } = user || {};
	const { data, isLoading, isError, error } =
		useGetConversationsQuery(email) || {};
	const { data: conversations, totalCount } = data || {};
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const dispatch = useDispatch();

	const fetchMore = () => {
		setPage((prevPage) => prevPage + 1);
	};

	useEffect(() => {
		if (page > 1) {
			dispatch(
				conversationsApi.endpoints.getMoreConversations.initiate({
					email,
					page,
				})
			);
		}
	}, [page, email, dispatch]);

	useEffect(() => {
		if (totalCount) {
			const more =
				Math.ceil(
					totalCount / +process.env.REACT_APP_CONVERSATIONS_PER_PAGE
				) > page;
			setHasMore(more);
		}
	}, [totalCount, page]);

	let content = null;
	if (isLoading) {
		content = <li className="m-2 text-center">Loading...</li>;
	} else if (isError) {
		content = <Error message={error.data} />;
	} else if (conversations?.length === 0) {
		content = <li className="m-2 text-center">No conversations yet</li>;
	} else if (conversations) {
		content = (
			<InfiniteScroll
				dataLength={conversations.length}
				next={fetchMore}
				hasMore={hasMore}
				loader={<h4>Loading...</h4>}
				height={window.innerHeight - 129}
			>
				{conversations.map((conversation) => {
					const { id, users, message, timestamp } = conversation;
					const { name, email: partnerEmail } =
						getPartnerInfo(users, email) || {};

					return (
						<li key={id}>
							<Link to={`/inbox/${id}`}>
								<ChatItem
									avatar={gravatarUrl(partnerEmail, {
										size: 80,
									})}
									name={name}
									lastMessage={message}
									lastTime={moment(timestamp).fromNow()}
								/>
							</Link>
						</li>
					);
				})}
			</InfiniteScroll>
		);
	}

	return <ul>{content}</ul>;
}
