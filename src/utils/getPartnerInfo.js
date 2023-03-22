const getPartnerInfo = (participants, loggedInEmail) => {
	return participants.find(
		(participant) => participant.email !== loggedInEmail
	);
};

export default getPartnerInfo;
