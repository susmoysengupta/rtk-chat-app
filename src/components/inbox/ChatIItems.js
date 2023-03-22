import gravatarUrl from 'gravatar-url';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useGetConversationsQuery } from '../../features/conversations/conversationsApi';
import getPartnerInfo from '../../utils/getPartnerInfo';
import Error from '../ui/Error';
import ChatItem from './ChatItem';

export default function ChatItems() {
	const { user } = useSelector((state) => state.auth);
	const { email } = user || {};
	const {
		data: conversations,
		isLoading,
		isError,
		error,
	} = useGetConversationsQuery(email);

	let content = null;
	if (isLoading) {
		content = <li className="m-2 text-center">Loading...</li>;
	} else if (isError) {
		content = <Error message={error.data} />;
	} else if (conversations?.length === 0) {
		content = <li className="m-2 text-center">No conversations yet</li>;
	} else if (conversations) {
		content = conversations.map((conversation) => {
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
		});
	}

	return <ul>{content}</ul>;
}
